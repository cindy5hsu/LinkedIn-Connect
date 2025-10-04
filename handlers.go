package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// LinkedInConnectRequest represents the request payload for LinkedIn connection
type LinkedInConnectRequest struct {
	Email            string `json:"email" binding:"required"`
	Name             string `json:"name" binding:"required"`
	Method           string `json:"method" binding:"required"` // "credentials" or "cookies"
	Username         string `json:"username,omitempty"`
	Password         string `json:"password,omitempty"`
	Cookies          string `json:"cookies,omitempty"`
	VerificationCode string `json:"verificationCode,omitempty"`
}

// UnipileConnectRequest represents the request to Unipile API
type UnipileConnectRequest struct {
	Provider         string `json:"provider"`
	Username         string `json:"username,omitempty"`
	Email            string `json:"email,omitempty"`
	Password         string `json:"password,omitempty"`
	AccessToken      string `json:"access_token,omitempty"`
	VerificationCode string `json:"verification_code,omitempty"`
	UserAgent        string `json:"user_agent,omitempty"`
}

// UnipileResponse represents the response from Unipile API
type UnipileResponse struct {
	AccountID string `json:"account_id"`
	Message   string `json:"message"`
	Error     string `json:"error,omitempty"`
}

// APIResponse represents a standard API response
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// handleLinkedInConnect handles LinkedIn account connection requests
func handleLinkedInConnect(c *gin.Context) {
	var req LinkedInConnectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Invalid request format: " + err.Error(),
		})
		return
	}

	// 觀察前端傳入資料，便於除錯
	fmt.Printf("[Connect] method=%s email=%s hasCredentials=%t hasCookies=%t username=%s\n",
		req.Method,
		req.Email,
		(req.Method == "credentials" && req.Username != "" && req.Password != ""),
		(req.Method == "cookies" && req.Cookies != ""),
		req.Username,
	)

	// Validate connection method
	if req.Method != "credentials" && req.Method != "cookies" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Method must be either 'credentials' or 'cookies'",
		})
		return
	}

	// Validate required fields based on method
	if req.Method == "credentials" && (req.Username == "" || req.Password == "") {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Username and password are required for credentials method",
		})
		return
	}

	if req.Method == "cookies" && req.Cookies == "" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Cookies are required for cookies method",
		})
		return
	}

	// Get or create user
	user, err := GetOrCreateUser(req.Email, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to create/get user: " + err.Error(),
		})
		return
	}

	// Prepare Unipile API request (align to Node implementation)
	unipileReq := UnipileConnectRequest{
		Provider: "LINKEDIN",
	}

	if req.Method == "credentials" {
		unipileReq.Username = req.Username
		unipileReq.Email = req.Username
		unipileReq.Password = req.Password
		// Add verification code if provided
		if req.VerificationCode != "" {
			unipileReq.VerificationCode = req.VerificationCode
		}
	} else {
		// cookies method
		unipileReq.AccessToken = req.Cookies
		// include user agent from the client request headers for better compatibility
		unipileReq.UserAgent = c.Request.Header.Get("User-Agent")
	}

	// Call Unipile API
	accountID, err := callUnipileAPI(unipileReq)
	if err != nil {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "LinkedIn connection failed: " + err.Error(),
		})
		return
	}

	// Save linked account
	if err := SaveLinkedAccount(user.ID, accountID, req.Email, req.Name); err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to save account: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Message: "LinkedIn account connected successfully",
		Data: map[string]interface{}{
			"account_id": accountID,
			"user_id":    user.ID,
		},
	})
}

// handleGetAccounts retrieves all linked accounts for a user
func handleGetAccounts(c *gin.Context) {
	email := c.Param("email")
	if email == "" {
		c.JSON(http.StatusBadRequest, APIResponse{
			Success: false,
			Error:   "Email parameter is required",
		})
		return
	}

	accounts, err := GetUserAccounts(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, APIResponse{
			Success: false,
			Error:   "Failed to retrieve accounts: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, APIResponse{
		Success: true,
		Message: fmt.Sprintf("Found %d linked accounts", len(accounts)),
		Data:    accounts,
	})
}

// callUnipileAPI makes a request to the Unipile API
func callUnipileAPI(req UnipileConnectRequest) (string, error) {
	apiURL := os.Getenv("UNIPILE_API_URL")
	apiKey := os.Getenv("UNIPILE_API_KEY")

	if apiURL == "" {
		apiURL = "https://api.unipile.com/v1"
	}

	if apiKey == "" {
		return "", fmt.Errorf("UNIPILE_API_KEY environment variable is not set")
	}

	// Build payload to match Unipile's expected shape
	payload := map[string]interface{}{
		"provider": "LINKEDIN",
	}
	// cookies method -> send access_token and user_agent; keep cookies for compatibility
	if req.AccessToken != "" {
		payload["access_token"] = req.AccessToken
		payload["cookies"] = req.AccessToken
		if req.UserAgent != "" {
			payload["user_agent"] = req.UserAgent
		}
	}
	// credentials method -> send both top-level username/password and nested credentials for compatibility
	if req.Username != "" || req.Password != "" || req.VerificationCode != "" {
		// top-level fields
		if req.Username != "" {
			payload["username"] = req.Username
		}
		if req.Password != "" {
			payload["password"] = req.Password
		}
		// nested credentials object
		creds := map[string]interface{}{}
		if req.Username != "" {
			creds["identifier"] = req.Username
			creds["login"] = req.Username
			creds["username"] = req.Username
			if strings.Contains(req.Username, "@") {
				creds["email"] = req.Username
			}
		}
		if req.Password != "" {
			creds["password"] = req.Password
		}
		if req.VerificationCode != "" {
			creds["verification_code"] = req.VerificationCode
		}
		payload["credentials"] = creds
	}

	// Prepare request body
	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %v", err)
	}

	// 打印 Unipile 請求內容以利除錯
	fmt.Printf("[Unipile] request body: %s\n", string(jsonData))

	// Create HTTP request
	httpReq, err := http.NewRequest("POST", apiURL+"/accounts", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Set headers (use Bearer as in Node implementation)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-API-KEY", apiKey)
// Ensure JSON body is parsed by Unipile
httpReq.Header.Set("Content-Type", "application/json")

	// Make the request
	client := &http.Client{}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %v", err)
	}

	// Parse response
	var unipileResp UnipileResponse
	if err := json.Unmarshal(body, &unipileResp); err != nil {
		return "", fmt.Errorf("failed to parse response: %v", err)
	}

	// Check for errors by status code
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		// Log the raw response for debugging
		fmt.Printf("API Error - Status: %d, Body: %s\n", resp.StatusCode, string(body))
		if unipileResp.Error != "" {
			return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, unipileResp.Error)
		}
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	if unipileResp.AccountID == "" {
		return "", fmt.Errorf("missing account_id in response: %s", string(body))
	}

	return unipileResp.AccountID, nil
}