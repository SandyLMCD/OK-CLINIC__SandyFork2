const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  petName: String,
  services: [String],
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'pending', 'overdue'], default: 'pending' },
  paymentMethod: String,
  invoiceNumber: String,
  date: String,     // issued date
  dueDate: String,  // due date
  paidDate: String
});

module.exports = mongoose.model('Invoice', invoiceSchema);
