import jwt from 'jsonwebtoken';
import { getDB, JWT_SECRET } from '../_lib/db.js';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = getDB();
    const user = db.users.find(u => u.id === payload.id);
    if (!user) return res.status(401).json({ error: 'User not found' });
    const { password: _, ...safe } = user;
    return res.json({ user: safe });
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
