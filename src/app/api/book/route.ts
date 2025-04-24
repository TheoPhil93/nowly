import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import mongoose from 'mongoose';

// 1. Schema definieren (nur beim ersten Import nötig)
const BookingSchema = new mongoose.Schema({
  slotId: Number,
  name: String,
  email: String,
  phone: String,
  date: String,
  time: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 2. Modell initialisieren (vermeidet "overwriteModelError" bei Hot Reload)
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// 3. POST-Handler
export async function POST(req: NextRequest) {
  try {
    const { slotId, name, email, phone, date, time } = await req.json();

    if (!slotId || !name || !email || !date || !time) {
      return NextResponse.json({ error: 'Bitte alle Pflichtfelder ausfüllen.' }, { status: 400 });
    }

    await connectDB();

    const existing = await Booking.findOne({ slotId, date, time });

    if (existing) {
      return NextResponse.json({ error: 'Dieser Slot ist bereits gebucht.' }, { status: 409 });
    }

    await Booking.create({ slotId, name, email, phone, date, time });

    return NextResponse.json({ message: 'Buchung erfolgreich gespeichert' }, { status: 201 });
  } catch (error) {
    console.error('Fehler bei der Buchung:', error);
    return NextResponse.json({ error: 'Serverfehler bei der Buchung' }, { status: 500 });
  }
}
