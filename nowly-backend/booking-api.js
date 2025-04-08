// booking-api.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const bookings = []; // Dummy-Daten für gespeicherte Buchungen

// POST-Endpunkt für Buchungen
app.post('/book', (req, res) => {
  const { name, email, service, date, time, slotId } = req.body;

  if (!name || !email || !service || !date || !time || !slotId) {
    return res.status(400).json({ message: 'Alle Felder müssen ausgefüllt werden.' });
  }

  const booking = { name, email, service, date, time, slotId };
  bookings.push(booking);

  // Erfolgreiche Antwort
  return res.status(200).json({ message: 'Buchung erfolgreich!', booking });
});

// Definiere den Port für deinen Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
