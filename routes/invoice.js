const express = require('express');
const Invoice = require('../models/Invoice');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

/* ---------- Customer: create invoice (used by CheckoutPage) ---------- */

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      petName,
      services = [],
      amount,
      invoiceNumber,
      date,
      dueDate,
    } = req.body;

    // basic validation
    if (amount == null) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const invoice = await Invoice.create({
      customer: req.user._id,
      petName,
      services,
      amount,
      invoiceNumber,
      date,
      dueDate,
      status: 'pending',        // default status
    });

    res.status(201).json(invoice);
  } catch (err) {
    console.error('POST /api/invoices error:', err);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

/* ---------- Customer: own invoices ---------- */

router.get('/', requireAuth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ customer: req.user._id }).sort({
      date: -1,
    });
    res.json(invoices);
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    res.status(500).json({ error: 'Failed to load invoices' });
  }
});

/* ---------- Customer: pay one invoice ---------- */

router.post('/:id/pay', requireAuth, async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const now = new Date().toISOString().split('T')[0];

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { status: 'paid', paymentMethod, paidDate: now },
      { new: true }
    );

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    console.error('POST /api/invoices/:id/pay error:', err);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
});

/* ---------- Admin: all invoices ---------- */

router.get('/admin', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const invoices = await Invoice.find()
      .populate('customer', 'name email')
      .sort({ date: -1 });

    res.json(invoices);
  } catch (err) {
    console.error('GET /api/invoices/admin error:', err);
    res.status(500).json({ error: 'Failed to load admin invoices' });
  }
});

module.exports = router;
