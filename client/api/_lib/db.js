// Simple JSON-file database for Vercel serverless
// Each cold start reads from /tmp/ (ephemeral) - good for demo/MVP
// For production scale, swap with Vercel KV, Supabase, or MongoDB

import fs from 'fs';
import path from 'path';

const DB_FILE = process.env.DB_PATH || '/tmp/wastezero-db.json';

function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    }
  } catch (e) {}
  return { users: [], listings: [], offers: [], orders: [], messages: [] };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('DB write error:', e.message);
  }
}

export function getDB() {
  const db = readDB();
  if (db.users.length === 0) {
    seedDemo(db);
    writeDB(db);
  }
  return db;
}

export function saveDB(db) {
  writeDB(db);
}

export function uuid() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function seedDemo(db) {
  const merchantId = 'demo-merchant-1';
  const buyerId = 'demo-buyer-1';
  db.users.push(
    { id: merchantId, email: 'baker@demo.com', password: 'demo123', name: 'Sam', role: 'merchant', business_name: "Sam's Artisan Bakery" },
    { id: buyerId, email: 'cafe@demo.com', password: 'demo123', name: 'Maria', role: 'buyer', business_name: 'Cafe Maria' }
  );
  db.listings.push(
    { id: 'l1', merchant_id: merchantId, title: 'Day-old sourdough bread', description: 'Fresh baked yesterday. 20 loaves. Perfect for sandwiches or toast.', category: 'baked', price: 15, quantity: 20, pickup_location: '123 Main St, Downtown', status: 'active' },
    { id: 'l2', merchant_id: merchantId, title: 'Pastry assortment', description: 'Croissants, muffins, danishes. Box of 30.', category: 'baked', price: 25, quantity: 5, pickup_location: '123 Main St, Downtown', status: 'active' },
    { id: 'l3', merchant_id: merchantId, title: 'Soup of the day', description: 'Tomato basil. 5 gallons, refrigerated.', category: 'prepared', price: 30, quantity: 3, pickup_location: '123 Main St, Downtown', status: 'active' },
    { id: 'l4', merchant_id: merchantId, title: 'Mixed greens', description: 'Pre-washed salad mix, approaching best-by date.', category: 'produce', price: 12, quantity: 8, pickup_location: '123 Main St, Downtown', status: 'active' }
  );
}

export const JWT_SECRET = process.env.JWT_SECRET || 'wastezero-dev-secret-2026';
export const PLATFORM_FEE_PCT = 0.12;
