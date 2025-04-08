const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nowly', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Datenbank verbunden'))
  .catch((err) => console.log('Datenbank-Fehler:', err));
