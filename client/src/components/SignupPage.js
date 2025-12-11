import React, { useState } from "react";

export function SignupPage(props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    confirm: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // email verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // 1) send verification code to email
  const handleSendCode = async () => {
    setMessage("");
    if (!form.email) {
      setMessage("Please enter your email first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-signup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to send verification code.");
      } else {
        setCodeSent(true);
        setMessage("Verification code sent to your email.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // 2) verify code
  const handleVerifyCode = async () => {
    setMessage("");
    if (!form.email || !verificationCode) {
      setMessage("Enter your email and verification code.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-signup-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, code: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailVerified(false);
        setMessage(data.error || "Invalid or expired code.");
      } else {
        setEmailVerified(true);
        setMessage("Email verified. You can now create your account.");
      }
    } catch {
      setMessage("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  // 3) final signup (requires emailVerified)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!emailVerified) {
      setMessage("Please verify your email before signing up.");
      return;
    }

    if (form.password !== form.confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <h2>Join OK Clinic</h2>
      <p>Create your account to get started</p>

      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          value={form.name}
          required
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          required
          onChange={(e) => {
            setEmailVerified(false); // reset verification if email changes
            setCodeSent(false);
            handleChange(e);
          }}
          className="sendCode-input"
        />
        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
          <button
            // name="sendCode"
            type="button"
            onClick={handleSendCode}
            disabled={loading || !form.email}
          >
            {loading ? "Sending..." : codeSent ? "Resend Code" : "Send Code"}
          </button>
        </div>

        {codeSent && (
          <>
            <label>Verification Code</label>
            <input
              name="verificationCode"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              maxLength={6}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="sendCode-input"
            />

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={loading || !verificationCode}
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </>
        )}

        {emailVerified && (
          <div className="message" style={{ color: "green" }}>
            Email verified.
          </div>
        )}
        <div style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}></div>
        <label>Phone Number</label>
        <input
          name="phone"
          placeholder="Enter your phone number"
          value={form.phone}
          onChange={handleChange}
        />

        <label>Address</label>
        <input
          name="address"
          placeholder="Enter your address"
          value={form.address}
          onChange={handleChange}
        />

        <label>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Create a password"
          value={form.password}
          required
          onChange={handleChange}
        />

        <label>Confirm Password</label>
        <input
          name="confirm"
          type="password"
          placeholder="Confirm your password"
          value={form.confirm}
          required
          onChange={handleChange}
        />

        <button type="submit">Create Account</button>

        {message && <div className="message">{message}</div>}

        <div className="links">
          <span>
            Already have an account?{" "}
            <button type="button" onClick={handleLoginNavigate}>
              Sign in
            </button>
          </span>
        </div>
      </form>
    </div>
  );
}