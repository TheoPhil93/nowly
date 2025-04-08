// src/app/api/auth/signup.js
import bcrypt from 'bcryptjs';
import { db } from '../../models/db';  // Deine Datenbankkonfiguration

export async function POST(req) {
  const { email, password, name } = await req.json();

  // Überprüfen, ob der Benutzer schon existiert
  const existingUser = await db.User.findOne({ where: { email } });
  if (existingUser) {
    return new Response(
      JSON.stringify({ message: 'Benutzer mit dieser E-Mail existiert bereits.' }),
      { status: 400 }
    );
  }

  // Passwort verschlüsseln
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    // Neuer Benutzer erstellen
    const newUser = await db.User.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return new Response(
      JSON.stringify({ message: 'Benutzer erfolgreich registriert!' }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Fehler bei der Registrierung!' }),
      { status: 500 }
    );
  }
}
