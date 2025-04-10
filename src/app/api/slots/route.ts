import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../utils/db';
import mongoose from 'mongoose';

// Slot-Schema definieren
const SlotSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    type: String,
    date: String,
    time: String,
    duration: Number,
    lngLat: [Number], // [lng, lat]
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'slots' }
);

const Slot = mongoose.models.Slot || mongoose.model('Slot', SlotSchema);

// Geocoding (hier nur Platzhalter – ersetzt durch echte Koordinaten oder API-Anbindung)
async function fakeGeocode(address: string): Promise<[number, number]> {
  // TODO: OSM, Mapbox oder Google Geocoding einbauen
  return [8.5417, 47.3769]; // Default: Zürich
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { name, address, type, date, time, duration } = body;

    if (!name || !address || !type || !date || !time || !duration) {
      return NextResponse.json({ error: 'Fehlende Felder' }, { status: 400 });
    }

    const lngLat = await fakeGeocode(address); // später durch echten Geocoder ersetzen

    await Slot.create({
      name,
      address,
      type,
      date,
      time,
      duration,
      lngLat,
    });

    return NextResponse.json({ message: 'Slot gespeichert' }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/slots] Fehler:', error);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}
