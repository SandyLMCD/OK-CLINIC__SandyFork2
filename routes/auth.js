const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";
// simple in-memory storage for signup verification
global.signupCodes = global.signupCodes || new Map();   // email -> { code, expiresAt }
global.verifiedEmails = global.verifiedEmails || new Set(); // verified email strings

// Nodemailer transporter with Gmail + debug
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
  debug: true,
});

// Optional verification
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer verify error:", error);
  } else {
    console.log("Nodemailer transporter is ready");
  }
});

function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || "customer" },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
}

/* ---------------- SIGNUP EMAIL VERIFICATION ---------------- */

// SEND SIGNUP VERIFICATION CODE
router.post("/send-signup-code", async (req, res) => {
  const { email } = req.body;
  console.log("SEND SIGNUP CODE for", email);

  try {
    if (!email) return res.status(400).json({ error: "Email is required." });

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered." });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    signupCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your signup verification code",
      text: `Your verification code is ${code}. It will expire in 10 minutes.`,
    });

    console.log("Signup verification email sent:", info.messageId);
    res.json({ message: "Verification code sent." });
  } catch (err) {
    console.error("send-signup-code error:", err);
    res.status(500).json({ error: "Failed to send verification email." });
  }
});

// VERIFY SIGNUP CODE
router.post("/verify-signup-code", async (req, res) => {
  const { email, code } = req.body;
  console.log("VERIFY SIGNUP CODE", email, code);

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required." });
  }

  const entry = signupCodes.get(email);
  if (
    !entry ||
    entry.expiresAt < Date.now() ||
    entry.code !== code.toString()
  ) {
    return res.status(400).json({ error: "Invalid or expired code." });
  }

  signupCodes.delete(email);
  verifiedEmails.add(email);

  res.json({ success: true, message: "Email verified. You can sign up now." });
});

/* ---------------- AUTH: SIGNUP / SIGNIN ---------------- */

// SIGNUP (requires verified email)
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, address, role } = req.body;

    if (!verifiedEmails.has(email)) {
      return res.status(400).json({ error: "Please verify your email first." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists." });

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash,
      phone,
      address,
      role: role || "customer",
    });

    // clear flag after successful signup
    verifiedEmails.delete(email);

    const token = createToken(user);

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SIGNIN
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "No user found." });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Incorrect password." });

    const token = createToken(user);

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* ---------------- PROFILE & PASSWORD RESET ---------------- */

// UPDATE PROFILE
router.put("/update-profile", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const { name, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true }
  ).select("-password -resetCode -resetCodeExpiry");

  res.json(user);
});

// REQUEST RESET CODE (send email with 6-digit code)
router.post("/request-reset", async (req, res) => {
  const { email } = req.body;
  console.log("REQUEST RESET for", email);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "No user found." });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = code;
    user.resetCodeExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset Code",
      text: `Your password reset code is ${code}. It will expire in 10 minutes.`,
    });

    console.log("Email sent:", info.messageId);
    res.json({ message: "Reset code sent!" });
  } catch (err) {
    console.error("Email send error:", err);
    res.status(500).json({ error: "Failed to send reset email." });
  }
});

// VERIFY RESET CODE
router.post("/verify-reset-code", async (req, res) => {
  const { email, resetCode } = req.body;
  console.log("VERIFY RESET CODE", email, resetCode);

  const user = await User.findOne({
    email,
    resetCode,
    resetCodeExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ error: "Invalid or expired reset code." });

  res.json({ success: true, message: "Code verified." });
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  const { email, resetCode, newPassword } = req.body;
  console.log("RESET PASSWORD for", email);

  const user = await User.findOne({
    email,
    resetCode,
    resetCodeExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ error: "Invalid or expired reset code." });

  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successful." });
});

// USERS
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password -resetCode -resetCodeExpiry");
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// SEED ADMIN
router.post("/seed-admin", async (req, res) => {
  try {
    const hashed = await bcrypt.hash("admin123", 10);

    const admin = await User.findOneAndUpdate(
      { email: "admin@okclinic.com" },
      {
        name: "Admin",
        email: "admin@okclinic.com",
        password: hashed,
        phone: "123456789",
        address: "Clinic",
        role: "admin",
      },
      { upsert: true, new: true }
    ).select("-password");

    res.json({ ok: true, admin });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to seed admin" });
  }
});

module.exports = router;
