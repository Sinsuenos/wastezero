import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { getDB, JWT_SECRET } from './_lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default async function handler(req, res) {
  try {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    const db = getDB();
    const user = db.users.find(u => u.id === userData.id);
    if (!user || !user.stripe_account_id) {
      return res.json({ connected: false, chargesEnabled: false, payoutsEnabled: false });
    }
    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    return res.json({
      connected: true,
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      requirements: account.requirements?.currently_due || [],
    });
  } catch (e) {
    console.error('Account status error:', e);
    return res.status(500).json({ error: e.message });
  }
}
