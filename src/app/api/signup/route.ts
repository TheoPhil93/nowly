// src/app/api/signup/route.ts
import connectDB from '../../../utils/TS_db'; // Wieder einkommentiert
import User from '../../models/User';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server'; // NextResponse hinzugefügt

export async function POST(req: NextRequest) {
    try {
        await connectDB(); // Verbindung aufbauen

        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            // Verwende NextResponse für konsistente API-Antworten
            return NextResponse.json({ message: 'Alle Felder sind erforderlich.' }, { status: 400 });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'E-Mail bereits registriert.' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role }); // 'role' wird hier verwendet, falls übergeben
        await newUser.save();

        return NextResponse.json({ message: 'Benutzer erfolgreich registriert.' }, { status: 201 }); // Status 201 für "Created"

    } catch (error) { // <-- Variable heisst wieder 'error'
        // Logge den tatsächlichen Fehler für Debugging-Zwecke
        console.error('[SIGNUP ERROR]', error);
        // Gib eine generische Fehlermeldung an den Client zurück
        return NextResponse.json({ message: 'Fehler bei der Registrierung auf dem Server.' }, { status: 500 });
    }
}