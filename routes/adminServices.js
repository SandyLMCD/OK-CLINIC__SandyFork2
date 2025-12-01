const express = require("express");
const router = express.Router();
const Service = require("../models/Service");

// GET /api/admin/services
router.get("/", async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: "Failed to load services" });
  }
});

// POST /api/admin/services
router.post("/", async (req, res) => {
  try {
    const { name, category, price, duration, status } = req.body;
    const service = await Service.create({
      name,
      category,
      price,
      duration,
      status: status || "active",
    });
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: "Failed to create service" });
  }
});

// PUT /api/admin/services/:id
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, duration, status } = req.body;

    const updated = await Service.findByIdAndUpdate(
      id,
      { name, category, price, duration, status },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Service not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: "Failed to update service" });
  }
});

// DELETE /api/admin/services/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Service.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Service not found" });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: "Failed to delete service" });
  }
});

module.exports = router;
