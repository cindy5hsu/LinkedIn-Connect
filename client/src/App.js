import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import LinkedInConnect from './components/LinkedInConnect';
import AccountsList from './components/AccountsList';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav">
      <Link 
        to="/" 
        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
      >
        Connect LinkedIn
      </Link>
      <Link 
        to="/accounts" 
        className={`nav-link ${location.pathname === '/accounts' ? 'active' : ''}`}
      >
        My Accounts
      </Link>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="container">
        <h1>LinkedIn Integration App</h1>
        <Navigation />
        <Routes>
          <Route path="/" element={<LinkedInConnect />} />
          <Route path="/accounts" element={<AccountsList />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;