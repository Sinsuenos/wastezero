import jwt from 'jsonwebtoken';
import { getDB, saveDB, uuid, JWT_SECRET, PLATFORM_FEE_PCT } from '../_lib/db.js';

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default function handler(req, res) {
  const db = getDB();

  if (req.method === 'GET') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    const orders = db.orders.filter(o => o.buyer_id === userData.id || o.merchant_id === userData.id);
    const enriched = orders.map(o => {
      const listing = db.listings.find(l => l.id === o.listing_id);
      const buyer = db.users.find(u => u.id === o.buyer_id);
      const merchant = db.users.find(u => u.id === o.merchant_id);
      return {
        ...o,
        title: listing?.title,
        pickup_location: listing?.pickup_location,
        buyer_name: buyer?.name,
        merchant_name: merchant?.name,
        business_name: merchant?.business_name
      };
    });
    return res.json({ orders: enriched });
  }

  if (req.method === 'POST') {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    const { listing_id } = req.body || {};
    const listing = db.listings.find(l => l.id === listing_id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ error: 'Listing not available' });
    const platform_fee = +(listing.price * PLATFORM_FEE_PCT).toFixed(2);
    const order = {
      id: uuid(),
      listing_id,
      buyer_id: userData.id,
      merchant_id: listing.merchant_id,
      amount: listing.price,
      platform_fee,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.orders.push(order);
    listing.status = 'sold';
    saveDB(db);
    return res.json({ order, client_secret: 'demo_secret_' + order.id });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
