// /middleware/auth-middleware.js

import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Kein Token gefunden' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Benutzerinformationen hinzufügen
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Ungültiges Token' });
  }
}
