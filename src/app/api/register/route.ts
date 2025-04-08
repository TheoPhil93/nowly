import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs'; // Zum Verschlüsseln des Passworts
import { prisma } from '@/lib/prisma'; // Prisma für DB-Interaktionen (optional)

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ message: 'Fehlende Felder' }, { status: 400 });
  }

  // Passwort verschlüsseln
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Neuen Benutzer in der DB anlegen
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Benutzer erfolgreich registriert' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Fehler bei der Registrierung' }, { status: 500 });
  }
}
