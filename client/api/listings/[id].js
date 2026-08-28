import jwt from 'jsonwebtoken';
import { getDB, saveDB, JWT_SECRET } from '../_lib/db.js';

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default function handler(req, res) {
  const { id } = req.query;
  const db = getDB();
  const listing = db.listings.find(l => l.id === id);
  if (!listing) return res.status(404).json({ error: 'Not found' });

  if (req.method === 'GET') {
    const merchant = db.users.find(u => u.id === listing.merchant_id);
    return res.json({ listing: { ...listing, merchant_name: merchant?.name, business_name: merchant?.business_name } });
  }

  if (req.method === 'DELETE') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    if (listing.merchant_id !== userData.id) return res.status(403).json({ error: 'Forbidden' });
    listing.status = 'expired';
    saveDB(db);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
