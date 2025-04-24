// src/app/api/check-db.ts
import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';

export async function GET() {
    try {
        await connectDB();
        return NextResponse.json({ message: 'Datenbankverbindung erfolgreich' });
    } catch (error) { // error ist 'unknown'
        console.error("[CHECK DB ERROR]", error); // Logge das gesamte Error-Objekt fürs Debugging
        let errorMessage = 'Unbekannter Fehler bei Datenbankverbindung.'; // Standard-Nachricht
        if (error instanceof Error) {
            errorMessage = error.message; 
        }
        return NextResponse.json({ message: 'Fehler bei der Verbindung zur Datenbank', error: errorMessage }, { status: 500 });
      }
}