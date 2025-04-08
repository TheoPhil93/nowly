import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, default: 'pending' },  // Status der Buchung (z.B. 'pending', 'confirmed')
});

const Booking = mongoose.model('Booking', BookingSchema);
export default Booking;
