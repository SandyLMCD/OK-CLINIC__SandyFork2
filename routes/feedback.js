const express = require('express');
const Feedback = require('../models/Feedback');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// POST /api/feedback
router.post('/', requireAuth, async (req, res) => {
  const { category, subject, message, rating } = req.body;

  if (!category || !subject || !message || !rating) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const feedback = await Feedback.create({
    userId: req.user._id,
    userName: req.user.name,
    userEmail: req.user.email,
    rating,
    category,
    subject,
    message,
    submittedAt: new Date(),
  });

  // IMPORTANT: send JSON with success true
  res.status(201).json({ success: true, id: feedback._id });
});

// GET /api/feedback (current user's feedback)
router.get('/', requireAuth, async (req, res) => {
  const feedback = await Feedback.find({ userId: req.user._id }).sort({
    submittedAt: -1,
  });

  // just send what you already have; frontend can read it directly
  res.json(feedback);
});

module.exports = router;
