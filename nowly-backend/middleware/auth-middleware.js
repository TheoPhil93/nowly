// auth-middleware.js
import jwt from 'jsonwebtoken';

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Kein Token gefunden' });
  }

  try {
    const decoded = jwt.verify(token, 'dein-geheimer-schlüssel');
    req.userId = decoded.userId;
    next();  // Weiter zur nächsten Middleware/Route
  } catch (error) {
    return res.status(401).json({ message: 'Ungültiges Token' });
  }
};

export default verifyToken;
