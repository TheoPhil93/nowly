// booking-api.js
import express from 'express';
import verifyToken from './auth-middleware.js';
import Booking from './models/Booking.js';

const router = express.Router();

// POST /api/bookings (mit Authentifizierung)
router.post('/bookings', verifyToken, async (req, res) => {
  const { slotId, name, email, phone, date, time } = req.body;

  try {
    // Überprüfe, ob der Slot existiert
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: 'Slot nicht gefunden' });
    }

    // Neue Buchung erstellen
    const booking = new Booking({
      slotId,
      name,
      email,
      phone,
      date,
      time,
      userId: req.userId,  // Benutzer ID aus dem Token
      status: 'pending',
    });

    await booking.save();

    // Erfolgreiche Buchung
    return res.status(201).json({ message: 'Buchung erfolgreich!' });
  } catch (error) {
    console.error('Fehler bei der Buchung:', error);
    return res.status(500).json({ message: 'Fehler bei der Buchung' });
  }
});

export default router;
