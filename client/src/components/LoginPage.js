import React, { useState } from "react";

export function LoginPage(props) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");



    // API sign-in flow for regular users
    try {
      const res = await fetch("http://localhost:5000/api/auth/signin", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(form),
});

      const data = await res.json();
      if (res.ok) {
        setMessage(`Welcome, ${data.name || data.email || "user"}!`);
        if (props.onLogin) {
          props.onLogin(data);
        }
      } else {
        setMessage(data.error || "Sign-in failed.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  // Navigation buttons fallback
  const handleSignup = () => {
    if (props.onNavigateToSignup) {
      props.onNavigateToSignup();
    } else {
      setMessage("Signup navigation not implemented in this demo.");
    }
  };
  const handlePasswordReset = () => {
    if (props.onNavigateToPasswordReset) {
      props.onNavigateToPasswordReset();
    } else {
      setMessage("Password reset navigation not implemented in this demo.");
    }
  };

  return (
    <div className="auth-form">
      <div className="icon-heart">&#9825;</div>
      <h2>Welcome to OK Clinic</h2>
      <p>Sign in to manage your pet's healthcare</p>
      <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          required
          onChange={handleChange}
        />
        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          required
          onChange={handleChange}
        />
        <button type="submit">Sign In</button>
        {message && <div className="message">{message}</div>}
        <div className="links">
          <button type="button" onClick={handlePasswordReset}>
            Forgot your password?
          </button>
          <br />
          <span>
            Don't have an account?{" "}
            <button type="button" onClick={handleSignup}>
              Sign up
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}
