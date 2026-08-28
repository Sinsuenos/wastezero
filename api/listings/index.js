import jwt from 'jsonwebtoken';
import { getDB, saveDB, uuid, JWT_SECRET } from '../_lib/db.js';

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default function handler(req, res) {
  const db = getDB();

  if (req.method === 'GET') {
    const { category, search, status } = req.query || {};
    let listings = db.listings;
    if (status) listings = listings.filter(l => l.status === status);
    if (category && category !== 'all') listings = listings.filter(l => l.category === category);
    if (search) {
      const s = String(search).toLowerCase();
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(s) || (l.description || '').toLowerCase().includes(s)
      );
    }
    const withMerchant = listings.map(l => {
      const merchant = db.users.find(u => u.id === l.merchant_id);
      return { ...l, merchant_name: merchant?.name, business_name: merchant?.business_name };
    });
    return res.json({ listings: withMerchant });
  }

  if (req.method === 'POST') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    if (userData.role !== 'merchant') return res.status(403).json({ error: 'Merchants only' });
    const listing = { id: uuid(), merchant_id: userData.id, ...req.body, status: 'active' };
    db.listings.push(listing);
    saveDB(db);
    return res.json({ listing });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
