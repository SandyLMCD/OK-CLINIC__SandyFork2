const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
  address: String,
  resetCode: String,
  resetCodeExpiry: Date,
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer'
  }
});

userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetCode;
    delete ret.resetCodeExpiry;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
