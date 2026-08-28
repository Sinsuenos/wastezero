import Stripe from 'stripe';
import { getDB, saveDB } from './_lib/db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const sig = req.headers['stripe-signature'];
    let event;
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      event = req.body;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const db = getDB();
      const order = db.orders.find(o => o.stripe_session_id === session.id);
      if (order) {
        order.status = 'paid';
        order.payment_intent_id = session.payment_intent;
        const listing = db.listings.find(l => l.id === order.listing_id);
        if (listing) listing.status = 'sold';
        saveDB(db);
      }
    }

    return res.json({ received: true });
  } catch (e) {
    console.error('Webhook error:', e);
    return res.status(400).json({ error: e.message });
  }
}
