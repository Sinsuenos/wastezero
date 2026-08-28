import { getDB } from './_lib/db.js';

export default function handler(req, res) {
  const db = getDB();
  const completedOrders = db.orders.filter(o => o.status === 'completed');
  const value = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  return res.json({
    orders_completed: completedOrders.length,
    value_recovered: +value.toFixed(2),
    co2_saved_tons: +(completedOrders.length * 2.5).toFixed(1),
    active_listings: db.listings.filter(l => l.status === 'active').length,
    total_merchants: db.users.filter(u => u.role === 'merchant').length
  });
}
