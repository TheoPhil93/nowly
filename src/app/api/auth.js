// /api/auth.js

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Beispiel-Datenbank
const users = [
  { id: 1, email: 'test@example.com', password: 'password' },
];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Benutzer nicht gefunden' });

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Ungültiges Passwort' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
