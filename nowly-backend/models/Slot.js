const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  service: String,  // z.B. Arzt, Friseur
  date: String,     // Datum des Termins
  time: String,     // Uhrzeit
  available: Boolean, // Termin verfügbar oder nicht
  subType: String,  // Z.B. Zahnarzt, Friseur
  address: String,  // Adresse des Anbieters
});

const Slot = mongoose.model('Slot', slotSchema);
module.exports = Slot;
