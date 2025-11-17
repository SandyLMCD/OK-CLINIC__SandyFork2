const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  address: String,
  resetCode: String,
  resetCodeExpiry: Date
});
module.exports = mongoose.model('User', userSchema);
