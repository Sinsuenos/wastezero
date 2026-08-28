import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { getDB, saveDB, uuid, JWT_SECRET } from './_lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

function auth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return null;
  try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const userData = auth(req);
    if (!userData) return res.status(401).json({ error: 'No token' });
    const db = getDB();
    const user = db.users.find(u => u.id === userData.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Create or get Stripe Connect account
    let accountId = user.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          url: 'https://wastezero-weld.vercel.app',
          mcc: '5499', // Miscellaneous Food Stores
        },
      });
      accountId = account.id;
      user.stripe_account_id = accountId;
      saveDB(db);
    }

    // Create account link for onboarding
    const origin = req.headers.origin || 'https://wastezero-weld.vercel.app';
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${origin}/my-listings?refresh=1`,
      return_url: `${origin}/my-listings?success=1`,
      type: 'account_onboarding',
    });

    return res.json({ url: accountLink.url, accountId });
  } catch (e) {
    console.error('Stripe onboarding error:', e);
    return res.status(500).json({ error: e.message });
  }
}
