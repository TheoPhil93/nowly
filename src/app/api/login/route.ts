import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import User from '@/app/models/User';
import bcrypt from 'bcryptjs';


export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        console.log('[LOGIN] Eingabe:', { email, password });

        await connectDB();
        console.log('[LOGIN] DB verbunden');

        const user = await User.findOne({ email });
        console.log('[LOGIN] User gefunden:', user);

        if (!user) {
            return NextResponse.json({ error: 'Nutzer nicht gefunden.' }, { status: 404 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log('[LOGIN] Passwort korrekt:', passwordMatch);

        if (!passwordMatch) {
            return NextResponse.json({ error: 'Falsches Passwort.' }, { status: 401 });
        }

        return NextResponse.json({
            message: 'Login erfolgreich',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (err) {
        console.error('[LOGIN ERROR]', err);
        return NextResponse.json({ error: 'Serverfehler beim Login.' }, { status: 500 });
    }
}

