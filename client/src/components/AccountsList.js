import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccountsList = () => {
  const [email, setEmail] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchAccounts = async () => {
    if (!email.trim()) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await axios.get(`/api/accounts/${encodeURIComponent(email)}`);
      
      if (response.data.success) {
        setAccounts(response.data.accounts);
        setUserInfo({
          user_id: response.data.user_id,
          email: response.data.email
        });
        
        if (response.data.accounts.length === 0) {
          setMessage('No linked accounts found for this email');
          setMessageType('error');
        } else {
          setMessage(`Found ${response.data.accounts.length} linked account(s)`);
          setMessageType('success');
        }
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to fetch accounts');
      setMessageType('error');
      setAccounts([]);
      setUserInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAccounts();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="card">
      <h2>My Linked Accounts</h2>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email to view linked accounts"
          />
        </div>
        
        <button 
          type="submit" 
          className="btn"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View My Accounts'}
        </button>
      </form>

      {message && (
        <div className={`alert alert-${messageType}`}>
          {message}
        </div>
      )}

      {userInfo && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px' }}>
          <h4>User Information</h4>
          <p><strong>User ID:</strong> {userInfo.user_id}</p>
          <p><strong>Email:</strong> {userInfo.email}</p>
        </div>
      )}

      {accounts.length > 0 && (
        <div>
          <h3>Connected Accounts ({accounts.length})</h3>
          <ul className="accounts-list">
            {accounts.map((account) => (
              <li key={account.id} className="account-item">
                <h4>{account.provider.charAt(0).toUpperCase() + account.provider.slice(1)} Account</h4>
                <p><strong>Account ID:</strong> {account.account_id}</p>
                <p><strong>Provider:</strong> {account.provider}</p>
                <p><strong>Connected:</strong> {formatDate(account.created_at)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && accounts.length === 0 && userInfo && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No Accounts Connected</h3>
          <p>You haven't connected any LinkedIn accounts yet.</p>
          <p>Go to the "Connect LinkedIn" page to add your first account.</p>
        </div>
      )}
    </div>
  );
};

export default AccountsList;