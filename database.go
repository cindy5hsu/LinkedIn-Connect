package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"
)

// User represents a user in the system
type User struct {
	ID       int       `json:"id"`
	Email    string    `json:"email"`
	Name     string    `json:"name"`
	Created  time.Time `json:"created"`
}

// LinkedAccount represents a linked LinkedIn account
type LinkedAccount struct {
	ID        int       `json:"id"`
	UserID    int       `json:"user_id"`
	AccountID string    `json:"account_id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	Created   time.Time `json:"created"`
}

// Database represents our simple file-based database
type Database struct {
	Users          []User          `json:"users"`
	LinkedAccounts []LinkedAccount `json:"linked_accounts"`
	NextUserID     int             `json:"next_user_id"`
	NextAccountID  int             `json:"next_account_id"`
}

var db *Database
var dbPath string

// InitDatabase initializes the file-based database
func InitDatabase() error {
	dbPath = os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = "./database.json"
	}

	// Create directory if it doesn't exist
	dir := filepath.Dir(dbPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create database directory: %v", err)
	}

	// Load existing database or create new one
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		db = &Database{
			Users:          []User{},
			LinkedAccounts: []LinkedAccount{},
			NextUserID:     1,
			NextAccountID:  1,
		}
		return saveDatabase()
	}

	return loadDatabase()
}

// loadDatabase loads the database from file
func loadDatabase() error {
	data, err := os.ReadFile(dbPath)
	if err != nil {
		return fmt.Errorf("failed to read database file: %v", err)
	}

	if err := json.Unmarshal(data, &db); err != nil {
		return fmt.Errorf("failed to unmarshal database: %v", err)
	}

	log.Printf("Database loaded successfully with %d users and %d linked accounts", len(db.Users), len(db.LinkedAccounts))
	return nil
}

// saveDatabase saves the database to file
func saveDatabase() error {
	data, err := json.MarshalIndent(db, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal database: %v", err)
	}

	if err := os.WriteFile(dbPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write database file: %v", err)
	}

	return nil
}

// GetOrCreateUser gets an existing user or creates a new one
func GetOrCreateUser(email, name string) (*User, error) {
	// Check if user already exists
	for i := range db.Users {
		if db.Users[i].Email == email {
			return &db.Users[i], nil
		}
	}

	// Create new user
	user := User{
		ID:      db.NextUserID,
		Email:   email,
		Name:    name,
		Created: time.Now(),
	}

	db.Users = append(db.Users, user)
	db.NextUserID++

	if err := saveDatabase(); err != nil {
		return nil, err
	}

	log.Printf("Created new user: %s (%s)", name, email)
	return &user, nil
}

// SaveLinkedAccount saves a linked LinkedIn account
func SaveLinkedAccount(userID int, accountID, email, name string) error {
	// Check if account already exists for this user
	for i := range db.LinkedAccounts {
		if db.LinkedAccounts[i].UserID == userID && db.LinkedAccounts[i].AccountID == accountID {
			// Update existing account
			db.LinkedAccounts[i].Email = email
			db.LinkedAccounts[i].Name = name
			return saveDatabase()
		}
	}

	// Create new linked account
	account := LinkedAccount{
		ID:        db.NextAccountID,
		UserID:    userID,
		AccountID: accountID,
		Email:     email,
		Name:      name,
		Created:   time.Now(),
	}

	db.LinkedAccounts = append(db.LinkedAccounts, account)
	db.NextAccountID++

	if err := saveDatabase(); err != nil {
		return err
	}

	log.Printf("Saved linked account: %s (%s) for user ID %d", name, email, userID)
	return nil
}

// GetUserAccounts gets all linked accounts for a user
func GetUserAccounts(email string) ([]LinkedAccount, error) {
	// Find user first
	var userID int
	found := false
	for _, user := range db.Users {
		if user.Email == email {
			userID = user.ID
			found = true
			break
		}
	}

	if !found {
		return []LinkedAccount{}, nil
	}

	// Get all linked accounts for this user
	var accounts []LinkedAccount
	for _, account := range db.LinkedAccounts {
		if account.UserID == userID {
			accounts = append(accounts, account)
		}
	}

	return accounts, nil
}