# LinkedIn Integration App (Go Backend)

A full-stack application that integrates with Unipile's LinkedIn API to connect and manage LinkedIn accounts. Built with **Go (Gin framework)** backend, **SQLite** database, and **React** frontend.

## 🚀 Live Demo
👉 [Bridge Construction](https://naples-rating-bridge-construction.trycloudflare.com/)

![image](https://github.com/cindy5hsu/LinkedIn-Connect/blob/main/linkit-ui-overview.png)


## 🚀 Features

- **LinkedIn Account Connection**: Connect via credentials or cookies
- **Account Management**: Store and retrieve linked accounts
- **User Management**: Automatic user creation and management
- **RESTful API**: Clean API endpoints for frontend integration
- **Database Persistence**: SQLite database with proper schema
- **CORS Support**: Cross-origin requests enabled
- **Error Handling**: Comprehensive error handling and validation
- **Production Ready**: Docker support and deployment configurations

## 🛠 Tech Stack

### Backend
- **Go 1.21+** - Main programming language
- **Gin** - HTTP web framework
- **SQLite** - Database (with go-sqlite3 driver)
- **Godotenv** - Environment variable management

### Frontend
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Modern CSS** - Responsive styling

### Deployment
- **Docker** - Containerization
- **Heroku** - Cloud deployment (ready)

## 📁 Project Structure

```
linkedin-integration-app/
├── main.go              # Main server file
├── database.go          # Database models and operations
├── handlers.go          # API route handlers
├── go.mod              # Go module dependencies
├── go.sum              # Go module checksums
├── .env                # Environment variables
├── Dockerfile          # Docker configuration
├── Procfile            # Heroku deployment
├── start-go.bat        # Windows startup script
├── client/             # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── index.html          # Standalone frontend (development)
└── README.md
```

## 🗄 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Linked Accounts Table
```sql
CREATE TABLE linked_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    account_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, provider, account_id)
);
```

## 🔌 API Endpoints

### POST /api/linkedin/connect
Connect a LinkedIn account using credentials or cookies.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "User Name",
  "method": "credentials", // or "cookies"
  "username": "linkedin_username", // for credentials method
  "password": "linkedin_password", // for credentials method
  "cookies": "cookie_string" // for cookies method
}
```

**Response:**
```json
{
  "success": true,
  "message": "LinkedIn account connected successfully",
  "data": {
    "account_id": "linkedin_account_id",
    "user_id": 1
  }
}
```

### GET /api/accounts/:email
Retrieve all linked accounts for a user.

**Response:**
```json
{
  "success": true,
  "message": "Found 2 linked accounts",
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "provider": "linkedin",
      "account_id": "linkedin_account_id",
      "created_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

## ⚙️ Setup Instructions

### Prerequisites
- **Go 1.21+** installed
- **Unipile API Key** (get from [Unipile](https://unipile.com))

### Quick Start (Windows)

1. **Install Go** (if not already installed):
   - Download from https://golang.org/dl/
   - Install and restart your computer

2. **Configure Environment**:
   - Open `.env` file
   - Replace `your_unipile_api_key_here` with your actual API key

3. **Start the Application**:
   ```bash
   # Option 1: Use batch file (recommended)
   double-click start-go.bat
   
   # Option 2: Manual commands
   go mod tidy
   go build -o linkedin-integration-app.exe .
   ./linkedin-integration-app.exe
   ```

4. **Access the Application**:
   - Open browser to http://localhost:5000

### Manual Setup

1. **Clone and Navigate**:
   ```bash
   cd "AI"
   ```

2. **Install Dependencies**:
   ```bash
   go mod tidy
   ```

3. **Configure Environment**:
   ```bash
   # Edit .env file
   PORT=5000
   UNIPILE_API_URL=https://api.unipile.com/v1
   UNIPILE_API_KEY=your_actual_api_key_here
   DATABASE_PATH=./linkedin_integration.db
   NODE_ENV=development
   ```

4. **Build and Run**:
   ```bash
   go build -o linkedin-integration-app.exe .
   ./linkedin-integration-app.exe
   ```

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t linkedin-integration-app .

# Run container
docker run -p 5000:5000 --env-file .env linkedin-integration-app
```

## ☁️ Heroku Deployment

1. **Install Heroku CLI**
2. **Login and Create App**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Set Environment Variables**:
   ```bash
   heroku config:set UNIPILE_API_KEY=your_api_key_here
   heroku config:set UNIPILE_API_URL=https://api.unipile.com/v1
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy Go backend"
   git push heroku main
   ```

## 🎯 Usage

1. **Connect LinkedIn Account**:
   - Fill in your email and name
   - Choose connection method (credentials or cookies)
   - Submit the form

2. **View Connected Accounts**:
   - Navigate to "View Accounts" page
   - Enter your email to see linked accounts

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables for sensitive data
- Validate all user inputs
- Use HTTPS in production
- Regularly update dependencies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
