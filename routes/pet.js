const express = require('express');
const Pet = require('../models/Pet');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET /api/pets
router.get('/', requireAuth, async (req, res) => {
  try {
    const pets = await Pet.find({ owner: req.user._id });
    res.json(pets);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/pets
router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, species, breed, age } = req.body;
    const pet = await Pet.create({
      owner: req.user._id,
      name,
      species,
      breed,
      age,
    });
    res.json(pet);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
