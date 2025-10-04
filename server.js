require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
const db = new Database();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from React build or standalone HTML
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
} else {
  // Serve standalone HTML file for development
  app.use(express.static(__dirname));
}

// Unipile LinkedIn Connect Endpoint
app.post('/api/linkedin/connect', async (req, res) => {
  try {
    const { email, credentials, cookies } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get or create user
    const user = await db.getOrCreateUser(email);

    // Prepare Unipile request payload
    const unipilePayload = {
      provider: 'linkedin',
      ...(credentials && { credentials }),
      ...(cookies && { cookies })
    };

    // Make request to Unipile API
    const unipileResponse = await axios.post(
      `${process.env.UNIPILE_API_URL}/accounts`,
      unipilePayload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.UNIPILE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { account_id } = unipileResponse.data;

    if (!account_id) {
      return res.status(400).json({ error: 'Failed to get account_id from Unipile' });
    }

    // Save linked account to database
    const linkedAccount = await db.saveLinkedAccount(user.id, 'linkedin', account_id);

    res.json({
      success: true,
      message: 'LinkedIn account connected successfully',
      account_id,
      user_id: user.id
    });

  } catch (error) {
    console.error('LinkedIn connect error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to connect LinkedIn account',
      details: error.response?.data?.message || error.message
    });
  }
});

// Get User's Linked Accounts Endpoint
app.get('/api/accounts/:email', async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Get user
    const user = await db.getOrCreateUser(email);
    
    // Get user's linked accounts
    const accounts = await db.getUserAccounts(user.id);

    res.json({
      success: true,
      user_id: user.id,
      email: user.email,
      accounts
    });

  } catch (error) {
    console.error('Get accounts error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch accounts',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // Serve standalone HTML for development
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close();
  process.exit(0);
});