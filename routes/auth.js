const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();
const JWT_SECRET = 'secret';

function createToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role || 'customer' },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: 'Email already exists.' });

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hash,
    phone,
    address,
    role: role || 'customer'
  });

  const token = createToken(user);

  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    role: user.role,
    token
  });
});

// SIGNIN
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: 'No user found.' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Incorrect password.' });

  const token = createToken(user);

  res.json({
    id: user._id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    address: user.address,
    role: user.role,
    token
  });
});

// UPDATE PROFILE (customer)
router.put('/update-profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  const { name, phone, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, address },
    { new: true }
  ).select('-password -resetCode -resetCodeExpiry');

  res.json(user);
});

// REQUEST RESET CODE
router.post('/request-reset', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: 'No user found.' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = code;
  user.resetCodeExpiry = Date.now() + 10 * 60 * 1000;
  await user.save();

  const transporter = nodemailer.createTransport({ sendmail: true });
  await transporter.sendMail({
    to: email,
    subject: 'Your Password Reset Code',
    text: `Your password reset code is ${code}`
  });

  res.json({ message: 'Reset code sent!' });
});

// VERIFY RESET CODE
router.post('/verify-reset-code', async (req, res) => {
  const { email, resetCode } = req.body;

  const user = await User.findOne({
    email,
    resetCode,
    resetCodeExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset code.' });

  res.json({ success: true, message: 'Code verified.' });
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetCode,
    resetCodeExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ error: 'Invalid or expired reset code.' });

  const hash = await bcrypt.hash(newPassword, 10);
  user.password = hash;
  user.resetCode = undefined;
  user.resetCodeExpiry = undefined;
  await user.save();

  res.json({ message: 'Password reset successful.' });
});

// USERS (for admin/clients tab)
router.get('/users', async (req, res) => {
  const users = await User.find({}, '-password -resetCode -resetCodeExpiry');
  res.json(users);
});

router.post('/seed-admin', async (req, res) => {
  try {
    const hashed = await bcrypt.hash('admin123', 10);

    const admin = await User.findOneAndUpdate(
      { email: 'admin@okclinic.com' },
      {
        name: 'Admin',
        email: 'admin@okclinic.com',
        password: hashed,
        phone: '123456789',
        address: 'Clinic',
        role: 'admin',
      },
      { upsert: true, new: true }
    ).select('-password');

    res.json({ ok: true, admin });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to seed admin' });
  }
});


module.exports = router;
