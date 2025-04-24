// src/app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../utils/TS_db'; 
import mongoose from 'mongoose';

// Schema nur definieren – ohne await!
const BookingSchema = new mongoose.Schema(
  {
    slotId: Number, // Besser: mongoose.Schema.Types.ObjectId, ref: 'Slot' wenn du Slot IDs hast
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) { 
  try {
    await connectDB();

    const bookings = await Booking.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error('[GET /api/bookings] Fehler:', error);
    // Typ-Check für Error empfohlen
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: 'Fehler beim Laden der Buchungen', details: errorMessage }, { status: 500 });
  }
}

