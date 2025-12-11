// server.js
require("dotenv").config();

console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASS length =",
  process.env.EMAIL_PASS && process.env.EMAIL_PASS.length
);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const authRoutes = require("./routes/auth");
const petRoutes = require("./routes/pet");
const bookingRoutes = require("./routes/booking");
const feedbackRoutes = require("./routes/feedback");
const invoiceRoutes = require("./routes/invoice");
const adminRoutes = require("./routes/admin");
const adminServicesRouter = require("./routes/adminServices");
const authMiddleware = require("./middleware/authMiddleware");
const Booking = require("./models/Booking");

const app = express();

app.use((req, res, next) => {
  console.log("REQ", req.method, req.url);
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
app.use(authMiddleware);

app.use("/api/pets", petRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/services", adminServicesRouter);

/* ---------- 12-hour reminder scheduler ---------- */

const reminderTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const REMINDER_INTERVAL_MS = 5 * 60 * 1000; // check every 5 minutes
const REMINDER_BEFORE_MS = 12 * 60 * 60 * 1000; // 12 hours

setInterval(async () => {
  const now = new Date();
  const in12Hours = new Date(now.getTime() + REMINDER_BEFORE_MS);

  try {
    const bookings = await Booking.find({
      status: "upcoming",
      reminderSent: { $ne: true },
      appointmentDateTime: { $gte: now, $lte: in12Hours },
    })
      .populate("customer", "name email")
      .populate("pet", "name");

    for (const booking of bookings) {
      if (!booking.customer?.email) continue;

      const when = booking.appointmentDateTime.toLocaleString();
      const petName = booking.pet?.name || "your pet";

      await reminderTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: booking.customer.email,
        subject: "Upcoming Appointment Reminder - OK Clinic",
        text: `This is a reminder that ${petName} has an appointment on ${when}.`,
      });

      booking.reminderSent = true;
      await booking.save();
    }
  } catch (err) {
    console.error("Reminder job error:", err);
  }
}, REMINDER_INTERVAL_MS);

/* ---------- Mongo + server start ---------- */

const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/pawcare_db";

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((err) => console.error("Failed to connect to MongoDB:", err));
