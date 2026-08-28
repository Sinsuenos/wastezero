import jwt from 'jsonwebtoken';
import { getDB, saveDB, uuid, JWT_SECRET, hashPassword } from '../_lib/db.js';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { email, password, name, role, business_name } = req.body || {};
    if (!email || !password || !name || !role) return res.status(400).json({ error: 'Missing fields' });
    const db = getDB();
    if (db.users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already exists' });
    const user = { id: uuid(), email, password: hashPassword(password), name, role, business_name: business_name || null };
    db.users.push(user);
    saveDB(db);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...safe } = user;
    return res.json({ token, user: safe });
  } catch (e) {
    console.error('Signup error:', e);
    return res.status(500).json({ error: 'Server error: ' + e.message });
  }
}
