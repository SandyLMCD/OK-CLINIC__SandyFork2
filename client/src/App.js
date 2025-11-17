import React, { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { PasswordResetPage } from './components/PasswordResetPage';
import './App.css';

function App() {
  const [page, setPage] = useState('login');

  // Navigation handlers for child components
  const handleLoginNavigate = () => setPage('login');
  const handleSignupNavigate = () => setPage('signup');
  const handleResetNavigate = () => setPage('reset');

  return (
    <div className="App">
      {page === 'login' && (
        <LoginPage
          onNavigateToSignup={handleSignupNavigate}
          onNavigateToPasswordReset={handleResetNavigate}
        />
      )}
      {page === 'signup' && (
        <SignupPage
          onNavigateToLogin={handleLoginNavigate}
        />
      )}
      {page === 'reset' && (
        <PasswordResetPage
          onNavigateToLogin={handleLoginNavigate}
        />
      )}
    </div>
  );
}

export default App;
