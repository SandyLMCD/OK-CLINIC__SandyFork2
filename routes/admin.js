const express = require('express');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Invoice = require('../models/Invoice');
const Feedback = require('../models/Feedback');

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

/* ========= USERS ========= */

// GET /api/admin/users
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const users = await User.find(
      {},
      '-password -resetCode -resetCodeExpiry'
    );
    res.json(users);
  } catch (err) {
    console.error('GET /api/admin/users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { name, email, phone, address, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, address, role },
      { new: true }
    ).select('-password -resetCode -resetCodeExpiry');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('PUT /api/admin/users/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/users/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ========= PETS ========= */

// GET /api/admin/pets
router.get('/pets', requireAdmin, async (req, res) => {
  try {
    const pets = await Pet.find().populate('owner', 'name email');
    res.json(pets);
  } catch (err) {
    console.error('GET /api/admin/pets error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/pets/:id
router.put('/pets/:id', requireAdmin, async (req, res) => {
  try {
    const { name, species, breed, age } = req.body;
    const pet = await Pet.findByIdAndUpdate(
      req.params.id,
      { name, species, breed, age },
      { new: true }
    ).populate('owner', 'name email');

    if (!pet) return res.status(404).json({ error: 'Pet not found' });
    res.json(pet);
  } catch (err) {
    console.error('PUT /api/admin/pets/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/pets/:id
router.delete('/pets/:id', requireAdmin, async (req, res) => {
  try {
    await Pet.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/pets/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ========= INVOICES ========= */

// GET /api/admin/invoices
router.get('/invoices', requireAdmin, async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate('customer', 'name email')
      .sort({ date: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('GET /api/admin/invoices error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/admin/invoices/:id
router.put('/invoices/:id', requireAdmin, async (req, res) => {
  try {
    const { status, total, paymentMethod, paidDate } = req.body;

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status, total, paymentMethod, paidDate },
      { new: true }
    ).populate('customer', 'name email');

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('PUT /api/admin/invoices/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/invoices/:id
router.delete('/invoices/:id', requireAdmin, async (req, res) => {
  try {
    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/invoices/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ========= FEEDBACKS ========= */

// GET /api/admin/feedbacks
router.get('/feedbacks', requireAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email')   // use userId
      .sort({ submittedAt: -1 });         // use submittedAt

    res.json(feedbacks);
  } catch (err) {
    console.error('GET /api/admin/feedbacks error:', err);
    res.status(500).json({ error: 'Server error fetching feedbacks' });
  }
});

// PUT /api/admin/feedbacks/:id
router.put('/feedbacks/:id', requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('userId', 'name email');   // use userId

    if (!feedback) return res.status(404).json({ error: 'Feedback not found' });
    res.json(feedback);
  } catch (err) {
    console.error('PUT /api/admin/feedbacks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// DELETE /api/admin/feedbacks/:id
router.delete('/feedbacks/:id', requireAdmin, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/feedbacks/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
