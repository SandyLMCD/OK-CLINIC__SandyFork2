const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  species: String,
  breed: String,
  age: Number
});

module.exports = mongoose.model('Pet', petSchema);
