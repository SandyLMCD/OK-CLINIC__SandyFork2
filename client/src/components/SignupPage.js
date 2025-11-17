import React, { useState } from 'react';

export function SignupPage(props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    confirm: ""
  });
  const [message, setMessage] = useState('');

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (props.onSignup) {
          props.onSignup(data);
        } else {
          setMessage("Account created! You may now sign in.");
        }
      } else {
        setMessage(data.error || "Signup failed.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  const handleLoginNavigate = () => {
    if (props.onNavigateToLogin) {
      props.onNavigateToLogin();
    } else {
      setMessage("Login navigation not implemented in this demo.");
    }
  };

  return (
    <div className="auth-form">
      <div className="icon-heart">&#9825;</div>
      <h2>Join PawCare</h2>
      <p>Create your account to get started</p>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="name" placeholder="Enter your full name" value={form.name} required onChange={handleChange} />
        <label>Email</label>
        <input name="email" type="email" placeholder="Enter your email" value={form.email} required onChange={handleChange} />
        <label>Phone Number</label>
        <input name="phone" placeholder="Enter your phone number" value={form.phone} onChange={handleChange} />
        <label>Address</label>
        <input name="address" placeholder="Enter your address" value={form.address} onChange={handleChange} />
        <label>Password</label>
        <input name="password" type="password" placeholder="Create a password" value={form.password} required onChange={handleChange} />
        <label>Confirm Password</label>
        <input name="confirm" type="password" placeholder="Confirm your password" value={form.confirm} required onChange={handleChange} />
        <button type="submit">Create Account</button>
        {message && <div className="message">{message}</div>}
        <div className="links">
          <span>
            Already have an account?{" "}
            <button type="button" onClick={handleLoginNavigate}>Sign in</button>
          </span>
        </div>
      </form>
    </div>
  );
}
