const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },

  // existing date & time strings (used by your React UI)
  date: { type: String, required: true },  // YYYY-MM-DD
  time: { type: String, required: true },  // HH:MM

  // new: exact Date object for scheduling reminders
  appointmentDateTime: { type: Date, required: true },

  services: [
    {
      name: String,
      price: Number,
      duration: Number,
      description: String,
      category: String,
    },
  ],
  total: { type: Number, default: 0 },
  depositPaid: { type: Number, default: 0 },
  paymentMethod: { type: String },
  bookingConfirmed: { type: Boolean, default: false },
  notes: String,
  status: {
    type: String,
    enum: ["upcoming", "completed", "cancelled"],
    default: "upcoming",
  },

  // new: reminder flag
  reminderSent: { type: Boolean, default: false },
});

module.exports = mongoose.model("Booking", bookingSchema);
