import jwt from 'jsonwebtoken';
import { getDB, JWT_SECRET, verifyPassword } from '../_lib/db.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password } = req.body || {};
    const db = getDB();
    const user = db.users.find(u => u.email === email);
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safe } = user;
    return res.json({ token, user: safe });
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Server error: ' + e.message });
  }
}
