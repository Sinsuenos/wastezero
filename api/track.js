import { getDB } from './_lib/db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { event, listing_id, source } = req.body || {};
    const db = getDB();
    if (!db.events) db.events = [];
    db.events.push({
      event,
      listing_id,
      source,
      timestamp: new Date().toISOString(),
      ip: req.headers['x-forwarded-for'] || 'unknown'
    });
    if (db.events.length > 10000) db.events = db.events.slice(-10000);
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
