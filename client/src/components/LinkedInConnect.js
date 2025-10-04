import React, { useState } from 'react';
import axios from 'axios';

const LinkedInConnect = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    cookies: '',
    verificationCode: ''
  });
  const [connectionType, setConnectionType] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const payload = {
        email: formData.email,
        name: formData.name,
        method: connectionType === 'credentials' ? 'credentials' : 'cookies'
      };

      if (connectionType === 'credentials') {
        payload.username = formData.username;
        payload.password = formData.password;
        if (formData.verificationCode && formData.verificationCode.trim() !== '') {
          payload.verificationCode = formData.verificationCode.trim();
        }
      } else {
        payload.cookies = formData.cookies;
      }

      const response = await axios.post('/api/linkedin/connect', payload);

      if (response.data.success) {
        setMessage(`LinkedIn account connected successfully! Account ID: ${response.data.account_id}`);
        setMessageType('success');
        setShowVerification(false);
        setFormData({
          name: formData.name,
          email: formData.email, // keep user info
          username: '',
          password: '',
          cookies: '',
          verificationCode: ''
        });
      } else {
        const err = response.data.error || 'Failed to connect LinkedIn account';
        setMessage(err);
        setMessageType('error');
        if (err.toLowerCase().includes('verification') || err.toLowerCase().includes('code') || err.toLowerCase().includes('challenge')) {
          setShowVerification(true);
        }
      }
    } catch (error) {
      const err = error.response?.data?.error || error.message || 'Failed to connect LinkedIn account';
      setMessage(err);
      setMessageType('error');
      if (err.toLowerCase().includes('verification') || err.toLowerCase().includes('code') || err.toLowerCase().includes('challenge')) {
        setShowVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Connect Your LinkedIn Account</h2>
      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            placeholder="Enter your email address"
          />
        </div>

        <div className="form-group">
          <label>Connection Method</label>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
              <input
                type="radio"
                value="credentials"
                checked={connectionType === 'credentials'}
                onChange={(e) => setConnectionType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Username & Password
            </label>
            <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'normal' }}>
              <input
                type="radio"
                value="cookies"
                checked={connectionType === 'cookies'}
                onChange={(e) => setConnectionType(e.target.value)}
                style={{ marginRight: '8px' }}
              />
              Cookies
            </label>
          </div>
        </div>

        {connectionType === 'credentials' ? (
          <>
            <div className="form-group">
              <label htmlFor="username">LinkedIn Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                placeholder="Enter your LinkedIn username/email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">LinkedIn Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your LinkedIn password"
              />
            </div>

            {showVerification && (
              <div className="form-group">
                <label htmlFor="verificationCode">Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter the verification code from your email"
                />
                <small style={{ color: '#666', fontSize: '14px' }}>
                  Check your email for a verification code from LinkedIn
                </small>
              </div>
            )}
          </>
        ) : (
          <div className="form-group">
            <label htmlFor="cookies">LinkedIn Cookies *</label>
            <textarea
              id="cookies"
              name="cookies"
              value={formData.cookies}
              onChange={handleInputChange}
              required
              rows="6"
              placeholder="Paste your LinkedIn cookies here (JSON format or cookie string)"
            />
            <small style={{ color: '#666', fontSize: '14px' }}>
              You can get cookies from your browser's developer tools while logged into LinkedIn
            </small>
          </div>
        )}

        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect LinkedIn Account'}
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '15px', color: '#333' }}>How to use:</h4>
        <ol style={{ paddingLeft: '20px', color: '#666' }}>
          <li><strong>Credentials Method:</strong> Enter your LinkedIn username/email and password</li>
          <li><strong>Cookies Method:</strong> 
            <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
              <li>Log into LinkedIn in your browser</li>
              <li>Open Developer Tools (F12)</li>
              <li>Go to Application/Storage → Cookies → linkedin.com</li>
              <li>Copy the cookie values and paste them here</li>
            </ul>
          </li>
        </ol>
      </div>
    </div>
  );
};

export default LinkedInConnect;