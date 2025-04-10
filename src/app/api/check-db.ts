// src/app/api/check-db.ts
import { NextResponse } from 'next/server';
import connectDB from '../../../utils/db';

export async function GET() {
    try {
        // Versucht, die Verbindung zur MongoDB herzustellen
        await connectDB();
        return NextResponse.json({ message: 'Datenbankverbindung erfolgreich' });
    } catch (error) {
        return NextResponse.json({ message: 'Fehler bei der Verbindung zur Datenbank', error: error.message }, { status: 500 });
    }
}
