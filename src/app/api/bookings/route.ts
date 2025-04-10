import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../utils/db';
import mongoose from 'mongoose';

// Schema nur definieren – ohne await!
const BookingSchema = new mongoose.Schema(
  {
    slotId: Number,
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'bookings' }
);

// Bestehendes Modell wiederverwenden (Hot Reload vermeiden)
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

export async function GET(req: NextRequest) {
  try {
    await connectDB(); // await ist hier erlaubt – IN einer async-Funktion

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/bookings] Fehler:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Buchungen' }, { status: 500 });
  }
}
