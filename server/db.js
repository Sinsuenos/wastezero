import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';

const db = new Database('wastezero.db');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('merchant', 'buyer')),
    business_name TEXT,
    phone TEXT,
    address TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    merchant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    quantity TEXT NOT NULL,
    unit TEXT,
    original_value REAL NOT NULL,
    asking_price REAL NOT NULL,
    expires_at TEXT NOT NULL,
    pickup_location TEXT NOT NULL,
    pickup_window_start TEXT,
    pickup_window_end TEXT,
    images TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'pending', 'sold', 'expired')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (merchant_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    amount REAL NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'countered')),
    counter_amount REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    merchant_id TEXT NOT NULL,
    amount REAL NOT NULL,
    platform_fee REAL NOT NULL,
    payment_intent_id TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'picked_up', 'completed', 'cancelled')),
    pickup_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings(id),
    FOREIGN KEY (buyer_id) REFERENCES users(id),
    FOREIGN KEY (merchant_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    reviewer_id TEXT NOT NULL,
    reviewee_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (reviewer_id) REFERENCES users(id),
    FOREIGN KEY (reviewee_id) REFERENCES users(id)
  );
`);

// Seed sample data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
if (userCount === 0) {
  const seedUsers = [
    { email: 'baker@demo.com', password: 'demo123', name: 'Sourdough Sam', role: 'merchant', business_name: 'Sam\'s Artisan Bakery', phone: '555-0101', address: '123 Baker St, Portland, OR' },
    { email: 'cafe@demo.com', password: 'demo123', name: 'Maria Lopez', role: 'buyer', business_name: 'Cafe Maria', phone: '555-0202', address: '456 Main St, Portland, OR' }
  ];

  const insertUser = db.prepare('INSERT INTO users (id, email, password, name, role, business_name, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  seedUsers.forEach(u => {
    const hash = bcrypt.hashSync(u.password, 8);
    insertUser.run(uuid(), u.email, hash, u.name, u.role, u.business_name, u.phone, u.address);
  });

  const merchantId = db.prepare('SELECT id FROM users WHERE email = ?').get('baker@demo.com').id;
  
  const seedListings = [
    { title: 'Artisan Sourdough Loaves (10)', description: '10 sourdough loaves, baked this morning. Perfect for sandwiches or resale.', category: 'Bakery', quantity: '10', unit: 'loaves', original_value: 65, asking_price: 25, expires_at: 'Tomorrow 8pm', pickup_location: '123 Baker St, Portland, OR', images: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
    { title: 'Mixed Pastry Box', description: 'Box of 24 mixed pastries (croissants, danishes, muffins). Day-old but still delicious.', category: 'Bakery', quantity: '24', unit: 'pieces', original_value: 72, asking_price: 30, expires_at: 'Tonight 9pm', pickup_location: '123 Baker St, Portland, OR', images: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
    { title: 'Fresh Bagels (50 count)', description: '50 bagels, assorted flavors. Great for catering or event.', category: 'Bakery', quantity: '50', unit: 'bagels', original_value: 75, asking_price: 35, expires_at: 'Tomorrow 2pm', pickup_location: '123 Baker St, Portland, OR', images: 'https://images.unsplash.com/photo-1551415923-a2297c7fda79?w=400' }
  ];

  const insertListing = db.prepare('INSERT INTO listings (id, merchant_id, title, description, category, quantity, unit, original_value, asking_price, expires_at, pickup_location, pickup_window_start, pickup_window_end, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  seedListings.forEach(l => {
    insertListing.run(uuid(), merchantId, l.title, l.description, l.category, l.quantity, l.unit, l.original_value, l.asking_price, l.expires_at, l.pickup_location, '17:00', '20:00', l.images);
  });
  console.log('🌱 Seeded demo data (login: baker@demo.com / demo123)');
}

export default db;
