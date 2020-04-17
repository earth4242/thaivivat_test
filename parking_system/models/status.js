const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DBSchema_status = new Schema({
  parking_date: {
    type: Date,
    default: Date.now
  },
  lotsize: {
    type: Number,
    default: 0
  },
  lastedslot: {
    type: Number,
    default: 0
  },
  entry_amount: {
    type: Number,
    default: 0
  },
  exit_amount: {
    type: Number,
    default: 0
  }
});

module.exports = Parking_status = mongoose.model('parking_status', DBSchema_status);
