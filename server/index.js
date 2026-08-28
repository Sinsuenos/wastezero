import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from './db.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'wastezero-dev-secret-change-me';
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';
const PLATFORM_FEE_PCT = 0.12;

const auth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ============ AUTH ============
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, role, business_name, phone, address } = req.body;
  if (!email || !password || !name || !role) return res.status(400).json({ error: 'Missing fields' });
  if (db.prepare('SELECT id FROM users WHERE email = ?').get(email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  const hash = bcrypt.hashSync(password, 8);
  const id = uuid();
  db.prepare('INSERT INTO users (id, email, password, name, role, business_name, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(id, email, hash, name, role, business_name || null, phone || null, address || null);
  const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id, email, name, role, business_name, phone, address } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, business_name: user.business_name, phone: user.phone, address: user.address } });
});

app.get('/api/auth/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, business_name, phone, address FROM users WHERE id = ?').get(req.user.id);
  res.json({ user });
});

// ============ LISTINGS ============
app.get('/api/listings', (req, res) => {
  const { category, search, status = 'active' } = req.query;
  let query = `SELECT l.*, u.name as merchant_name, u.business_name FROM listings l JOIN users u ON l.merchant_id = u.id WHERE l.status = ?`;
  const params = [status];
  if (category && category !== 'all') { query += ' AND l.category = ?'; params.push(category); }
  if (search) { query += ' AND (l.title LIKE ? OR l.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  query += ' ORDER BY l.created_at DESC';
  res.json({ listings: db.prepare(query).all(...params) });
});

app.get('/api/listings/:id', (req, res) => {
  const listing = db.prepare(`SELECT l.*, u.name as merchant_name, u.business_name, u.phone as merchant_phone FROM listings l JOIN users u ON l.merchant_id = u.id WHERE l.id = ?`).get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  res.json({ listing });
});

app.post('/api/listings', auth, (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ error: 'Merchants only' });
  const { title, description, category, quantity, unit, original_value, asking_price, expires_at, pickup_location, pickup_window_start, pickup_window_end, images } = req.body;
  const id = uuid();
  db.prepare(`INSERT INTO listings (id, merchant_id, title, description, category, quantity, unit, original_value, asking_price, expires_at, pickup_location, pickup_window_start, pickup_window_end, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, req.user.id, title, description, category, quantity, unit, original_value, asking_price, expires_at, pickup_location, pickup_window_start, pickup_window_end, images || null);
  res.json({ listing: db.prepare('SELECT * FROM listings WHERE id = ?').get(id) });
});

app.get('/api/listings/merchant/:id', auth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  res.json({ listings: db.prepare('SELECT * FROM listings WHERE merchant_id = ? ORDER BY created_at DESC').all(req.params.id) });
});

app.delete('/api/listings/:id', auth, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  if (listing.merchant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE listings SET status = ? WHERE id = ?').run('expired', req.params.id);
  res.json({ success: true });
});

// ============ OFFERS ============
app.post('/api/offers', auth, (req, res) => {
  const { listing_id, amount, message } = req.body;
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status !== 'active') return res.status(400).json({ error: 'Listing not available' });
  if (req.user.role !== 'buyer') return res.status(403).json({ error: 'Buyers only' });
  const id = uuid();
  db.prepare('INSERT INTO offers (id, listing_id, buyer_id, amount, message) VALUES (?, ?, ?, ?, ?)')
    .run(id, listing_id, req.user.id, amount, message || null);
  res.json({ offer: db.prepare('SELECT * FROM offers WHERE id = ?').get(id) });
});

app.get('/api/offers/listing/:id', auth, (req, res) => {
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!listing) return res.status(404).json({ error: 'Not found' });
  if (listing.merchant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  res.json({ offers: db.prepare(`SELECT o.*, u.name as buyer_name, u.business_name FROM offers o JOIN users u ON o.buyer_id = u.id WHERE o.listing_id = ? ORDER BY o.created_at DESC`).all(req.params.id) });
});

app.get('/api/offers/buyer/:id', auth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  res.json({ offers: db.prepare(`SELECT o.*, l.title, l.images, l.pickup_location FROM offers o JOIN listings l ON o.listing_id = l.id WHERE o.buyer_id = ? ORDER BY o.created_at DESC`).all(req.params.id) });
});

app.put('/api/offers/:id', auth, (req, res) => {
  const { status, counter_amount } = req.body;
  const offer = db.prepare('SELECT * FROM offers WHERE id = ?').get(req.params.id);
  if (!offer) return res.status(404).json({ error: 'Not found' });
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(offer.listing_id);
  if (listing.merchant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  if (status === 'accepted') {
    db.prepare('UPDATE listings SET status = ? WHERE id = ?').run('pending', listing.id);
    db.prepare('UPDATE offers SET status = ? WHERE id = ?').run('accepted', req.params.id);
    db.prepare('UPDATE offers SET status = ? WHERE listing_id = ? AND id != ?').run('rejected', listing.id, req.params.id);
  } else {
    db.prepare('UPDATE offers SET status = ?, counter_amount = ? WHERE id = ?').run(status, counter_amount || null, req.params.id);
  }
  res.json({ success: true });
});

// ============ ORDERS ============
app.post('/api/orders', auth, (req, res) => {
  const { listing_id } = req.body;
  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (listing.status === 'sold' || listing.status === 'expired') return res.status(400).json({ error: 'Listing not available' });
  const platform_fee = +(listing.asking_price * PLATFORM_FEE_PCT).toFixed(2);
  const id = uuid();
  db.prepare('INSERT INTO orders (id, listing_id, buyer_id, merchant_id, amount, platform_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, listing_id, req.user.id, listing.merchant_id, listing.asking_price, platform_fee, 'pending');
  db.prepare('UPDATE listings SET status = ? WHERE id = ?').run('sold', listing_id);
  res.json({ order: db.prepare('SELECT * FROM orders WHERE id = ?').get(id), client_secret: 'demo_secret_' + id });
});

app.post('/api/orders/:id/confirm', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (order.buyer_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE orders SET status = ?, payment_intent_id = ? WHERE id = ?').run('paid', 'pi_demo_' + req.params.id, req.params.id);
  res.json({ success: true });
});

app.put('/api/orders/:id/complete', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (order.buyer_id !== req.user.id && order.merchant_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('completed', req.params.id);
  res.json({ success: true });
});

app.get('/api/orders/user/:id', auth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Forbidden' });
  const orders = db.prepare(`
    SELECT o.*, l.title, l.images, l.pickup_location,
           buyer.name as buyer_name, merchant.name as merchant_name, merchant.business_name
    FROM orders o
    JOIN listings l ON o.listing_id = l.id
    JOIN users buyer ON o.buyer_id = buyer.id
    JOIN users merchant ON o.merchant_id = merchant.id
    WHERE o.buyer_id = ? OR o.merchant_id = ?
    ORDER BY o.created_at DESC
  `).all(req.params.id, req.params.id);
  res.json({ orders });
});

// ============ MESSAGES ============
app.post('/api/messages', auth, (req, res) => {
  const { thread_id, content } = req.body;
  const id = uuid();
  db.prepare('INSERT INTO messages (id, thread_id, sender_id, content) VALUES (?, ?, ?, ?)')
    .run(id, thread_id, req.user.id, content);
  res.json({ message: db.prepare('SELECT * FROM messages WHERE id = ?').get(id) });
});

app.get('/api/messages/:thread_id', auth, (req, res) => {
  res.json({ messages: db.prepare('SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC').all(req.params.thread_id) });
});

// ============ STATS ============
app.get('/api/stats', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "completed"').get().count;
  const value = db.prepare('SELECT COALESCE(SUM(amount), 0) as total FROM orders WHERE status = "completed"').get().total;
  const co2 = +(total * 2.5).toFixed(1);
  res.json({ orders_completed: total, value_recovered: +value.toFixed(2), co2_saved_tons: co2 });
});

app.get('/', (req, res) => res.json({ name: 'WasteZero API', version: '1.0.0', status: 'live' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 WasteZero API running on http://localhost:${PORT}`);
});
