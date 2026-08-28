import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB, JWT_SECRET } from '../_lib/db.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { email, password } = req.body || {};
  const db = getDB();
  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  const { password: _, ...safe } = user;
  return res.json({ token, user: safe });
}
