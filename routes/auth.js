const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already exists.' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, phone, address });
  res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, address: user.address });
});

// Signin
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'No user found.' });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Incorrect password.' });
  const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '2h' });
  res.json({ id: user._id, email: user.email, name: user.name, phone: user.phone, address: user.address, token });
});

// Password Reset
router.post('/reset-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user found.' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = code;
  user.resetCodeExpiry = Date.now() + 3600 * 1000;
  await user.save();
  const transporter = nodemailer.createTransport({ sendmail: true });
  await transporter.sendMail({
    to: email,
    subject: "Your Password Reset Code",
    text: `Your password reset code is ${code}`
  });
  res.json({ message: "Reset code sent!" });
});

//wala pani
router.get('/users', async (req, res) => {
  const users = await User.find({}, '-password -resetCode -resetCodeExpiry');  // Hide sensitive fields
  res.json(users);
});

module.exports = router;
