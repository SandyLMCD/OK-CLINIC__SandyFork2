const express = require('express');
const Booking = require('../models/Booking');
const Pet = require('../models/Pet');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Create booking (customer)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { date, time, pet, services, notes } = req.body;

    const conflict = await Booking.findOne({
      date,
      time,
      status: { $ne: 'cancelled' }
    });
    if (conflict) return res.status(409).json({ error: 'Slot already booked' });

    const petObj = await Pet.findOne({ _id: pet, owner: req.user._id });
    if (!petObj) {
      return res
        .status(403)
        .json({ error: 'Pet not found or does not belong to user' });
    }

    const total =
      services?.reduce((sum, svc) => sum + (svc.price || 0), 0) || 0;
    const depositPaid = total > 0 ? total * 0.5 : 0;

    const booking = new Booking({
      customer: req.user._id,
      pet,
      date,
      time,
      services,
      total,
      depositPaid,
      notes,
      status: 'upcoming'
    });

    await booking.save();
    await booking.populate('pet', 'name species breed age');

    res.status(201).json(booking);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Customer: own bookings
router.get('/', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user._id }).populate(
      'pet'
    );
    res.json(bookings);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Admin: all bookings
router.get('/admin', requireAuth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const bookings = await Booking.find()
    .populate('customer', 'name email')
    .populate('pet', 'name species breed age');
  res.json(bookings);
});

module.exports = router;
