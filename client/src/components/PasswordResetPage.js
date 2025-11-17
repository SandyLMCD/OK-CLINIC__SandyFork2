import React, { useState } from 'react';

export function PasswordResetPage(props) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || data.error || "Reset failed.");
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  // Navigation fallback if prop not provided
  const handleBackToLogin = () => {
    if (props.onNavigateToLogin) {
      props.onNavigateToLogin();
    } else {
      setMessage("Back to login navigation not implemented in this demo.");
    }
  };

  return (
    <div className="auth-form">
      <div className="icon-heart">&#9825;</div>
      <h2>Reset Password</h2>
      <p>Enter your email to receive a reset code</p>
      <form onSubmit={handleSubmit}>
        <label>Email Address</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send Reset Code</button>
        {message && <div className="message">{message}</div>}
        <div className="links">
          <button type="button" onClick={handleBackToLogin}>&larr; Back to Sign In</button>
        </div>
      </form>
    </div>
  );
}
