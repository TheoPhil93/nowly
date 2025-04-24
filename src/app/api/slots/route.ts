// src/app/api/slots/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../utils/TS_db'; // Pfad prüfen
import mongoose from 'mongoose';

// Slot-Schema definieren
const SlotSchema = new mongoose.Schema(
  {
    name: String,
    address: String, // Wird gespeichert
    type: String,
    date: String,
    time: String,
    duration: Number,
    lngLat: { type: [Number], index: '2dsphere' }, // Korrekter Typ für Geo-Koordinaten
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'slots' }
);

const Slot = mongoose.models.Slot || mongoose.model('Slot', SlotSchema);

// Geocoding Platzhalter
async function fakeGeocode(address: string): Promise<[number, number]> {
  console.log(`[GEOCODE DUMMY] Geocoding für: ${address}`); // Zeigt, dass Adresse verwendet wird
  // TODO: Echten Geocoder implementieren!
  return [8.5417, 47.3769]; // Default: Zürich
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    // Stelle sicher, dass 'address' hier extrahiert wird
    const { name, address, type, date, time, duration } = body;

    if (!name || !address || !type || !date || !time || !duration) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 });
    }

    // 'address' wird hier für Geocoding verwendet
    const lngLat = await fakeGeocode(address);

    // 'address' wird hier zum Speichern verwendet
    await Slot.create({
      name,
      address, // Sicherstellen, dass es hier steht
      type,
      date,
      time,
      duration,
      lngLat,
    });

    return NextResponse.json({ message: 'Slot gespeichert' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/slots] Fehler:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    return NextResponse.json({ error: 'Serverfehler', details: errorMessage }, { status: 500 });
  }
}

// Füge hier ggf. GET etc. hinzu