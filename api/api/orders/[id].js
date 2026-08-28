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
  const order = db.orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Not found' });

  if (req.url?.includes('/confirm') && req.method === 'POST') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    if (order.buyer_id !== userData.id) return res.status(403).json({ error: 'Forbidden' });
    order.status = 'paid';
    order.payment_intent_id = 'pi_demo_' + order.id;
    saveDB(db);
    return res.json({ success: true });
  }

  if (req.url?.includes('/complete') && req.method === 'PUT') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    if (order.buyer_id !== userData.id && order.merchant_id !== userData.id) return res.status(403).json({ error: 'Forbidden' });
    order.status = 'completed';
    saveDB(db);
    return res.json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
