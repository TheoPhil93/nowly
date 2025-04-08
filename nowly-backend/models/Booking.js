const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },  // Slot ID
  user: {
    name: String,
    email: String,
  },
  bookedAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
