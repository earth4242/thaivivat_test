const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DBSchema_slot = new Schema({
  parking_date: {
    type: Date,
    default: Date.now
  },
  platnumber: {
    type: String,
    required: true
  },
  size: {
    type: String,
    required: true
  },
  slot: {
    type: Number,
    required: true
  },
  entry_time: {
    type: Date,
    default: Date.now
  },
  exit_time: {
    type: Date,
    default: Date.now
  },
  status: {
    type: Number,
    default: 0
  }
});

module.exports = Parking_slot = mongoose.model('Parking_slot', DBSchema_slot);
