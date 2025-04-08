const express = require('express');
const router = express.Router();
const { bookSlot, getSlots } = require('../controllers/slotController');

// POST: Buchung eines Slots
router.post('/book-slot', bookSlot);

// GET: Alle freien Slots
router.get('/slots', getSlots);

module.exports = router;
