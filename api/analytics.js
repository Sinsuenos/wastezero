import jwt from 'jsonwebtoken';
import { getDB, JWT_SECRET } from './_lib/db.js';

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default async function handler(req, res) {
  const userData = auth(req);
  if (!userData) return res.status(401).json({ error: 'No token' });
  const db = getDB();
  const events = db.events || [];

  // Last 7 days
  const now = Date.now();
  const last7 = events.filter(e => new Date(e.timestamp).getTime() > now - 7 * 24 * 60 * 60 * 1000);
  const last30 = events.filter(e => new Date(e.timestamp).getTime() > now - 30 * 24 * 60 * 60 * 1000);

  // Top events
  const eventCounts = {};
  last30.forEach(e => { eventCounts[e.event] = (eventCounts[e.event] || 0) + 1; });

  // Sources
  const sourceCounts = {};
  last30.forEach(e => { if (e.source) sourceCounts[e.source] = (sourceCounts[e.source] || 0) + 1; });

  // Listings
  const totalListings = db.listings.length;
  const activeListings = db.listings.filter(l => l.status === 'active').length;
  const totalOrders = db.orders.length;
  const completedOrders = db.orders.filter(o => o.status === 'completed' || o.status === 'paid').length;
  const totalRevenue = db.orders.reduce((s, o) => s + (o.amount || 0), 0);
  const platformFees = db.orders.reduce((s, o) => s + (o.platform_fee || 0), 0);

  return res.json({
    events_7d: last7.length,
    events_30d: last30.length,
    event_breakdown: eventCounts,
    traffic_sources: sourceCounts,
    metrics: {
      total_listings: totalListings,
      active_listings: activeListings,
      total_orders: totalOrders,
      completed_orders: completedOrders,
      total_revenue: +totalRevenue.toFixed(2),
      platform_earnings: +platformFees.toFixed(2)
    }
  });
}
