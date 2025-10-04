package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	if err := InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Create Gin router
	r := gin.Default()

	// CORS middleware
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API routes
	api := r.Group("/api")
	{
		api.POST("/linkedin/connect", handleLinkedInConnect)
		api.GET("/accounts/:email", handleGetAccounts)
	}

	// Serve static files (React build)
	r.Static("/static", "./client/build/static")
	r.StaticFile("/favicon.ico", "./client/build/favicon.ico")
	r.StaticFile("/manifest.json", "./client/build/manifest.json")

	// Serve React app or fallback to standalone HTML
	r.NoRoute(func(c *gin.Context) {
		// Check if React build exists
		if _, err := os.Stat("./client/build/index.html"); err == nil {
			c.File("./client/build/index.html")
		} else {
			// Fallback to standalone HTML for development
			c.File("./index.html")
		}
	})

	// Get port from environment or default to 5000
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}