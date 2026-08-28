import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import { getDB, saveDB, JWT_SECRET, PLATFORM_FEE_PCT } from './_lib/db.js';

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
    const { listing_id, quantity = 1 } = req.body || {};
    const db = getDB();
    const listing = db.listings.find(l => l.id === listing_id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ error: 'Listing not available' });

    const amount = Math.round(listing.price * quantity * 100); // cents
    const platformFee = Math.round(amount * PLATFORM_FEE_PCT);

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: listing.title,
            description: listing.description,
          },
          unit_amount: Math.round(listing.price * 100),
        },
        quantity,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || 'https://wastezero-weld.vercel.app'}/orders?success=1`,
      cancel_url: `${req.headers.origin || 'https://wastezero-weld.vercel.app'}/browse?canceled=1`,
      metadata: {
        listing_id: listing.id,
        buyer_id: userData.id,
        merchant_id: listing.merchant_id,
      },
    });

    // Create pending order
    const orderId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    db.orders.push({
      id: orderId,
      listing_id: listing.id,
      buyer_id: userData.id,
      merchant_id: listing.merchant_id,
      amount: listing.price * quantity,
      platform_fee: (listing.price * quantity * PLATFORM_FEE_PCT).toFixed(2),
      status: 'pending',
      stripe_session_id: session.id,
      created_at: new Date().toISOString()
    });
    listing.status = 'pending_payment';
    saveDB(db);

    return res.json({ url: session.url, sessionId: session.id, orderId });
  } catch (e) {
    console.error('Payment error:', e);
    return res.status(500).json({ error: 'Payment error: ' + e.message });
  }
}
