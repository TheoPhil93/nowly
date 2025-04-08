import express from 'express';
import bodyParser from 'body-parser';
import bookingRoutes from './routes/booking-api.js';

const app = express();

app.use(bodyParser.json());
app.use('/api', bookingRoutes);  // API-Routen einbinden

app.listen(5000, () => {
  console.log('Server läuft auf Port 5000');
});
