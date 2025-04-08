const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// Buchung eines Slots
exports.bookSlot = async (req, res) => {
  const { slotId, user } = req.body;

  const slot = await Slot.findById(slotId);
  if (!slot || !slot.available) {
    return res.status(400).json({ message: 'Slot bereits gebucht oder nicht vorhanden.' });
  }

  slot.available = false;
  await slot.save();

  const booking = new Booking({
    slotId,
    user,
  });

  await booking.save();
  res.json({ message: 'Termin gebucht!', booking });
};

// Alle freien Slots abrufen
exports.getSlots = async (req, res) => {
  const slots = await Slot.find({ available: true });
  res.json(slots);
};
