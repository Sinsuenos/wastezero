import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from './api';

const STORE_KEY = 'wastezero_token';

function Navbar({ user, onLogout }) {
  return (
    <nav style={{ background: '#16a34a', color: 'white', padding: '16px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 24, fontWeight: 800 }}>WasteZero</Link>
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/browse" style={{ color: 'white', textDecoration: 'none' }}>Browse</Link>
              {user.role === 'merchant' && <Link to="/create" style={{ color: 'white', textDecoration: 'none' }}>Sell Food</Link>}
              <Link to="/my-listings" style={{ color: 'white', textDecoration: 'none' }}>My Listings</Link>
              <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>Orders</Link>
              <span style={{ color: '#bbf7d0', fontSize: 14 }}>({user.role})</span>
              <button onClick={onLogout} style={{ background: '#15803d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
              <Link to="/signup" style={{ background: 'white', color: '#16a34a', padding: '6px 16px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Landing() {
  const [stats, setStats] = useState({ active_listings: 0, total_merchants: 0, orders_completed: 0 });
  useEffect(() => {
    api.getStats().then(s => setStats(s)).catch(() => {});
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4' }}>
      <div style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, marginBottom: 20, lineHeight: 1.1, margin: '0 0 20px' }}>Stop Food Waste. Start Earning.</h1>
        <p style={{ fontSize: 22, marginBottom: 40, opacity: 0.95 }}>Connect surplus food from restaurants and bakeries to buyers who need it.</p>
        <Link to="/signup" style={{ background: 'white', color: '#16a34a', padding: '18px 40px', borderRadius: 8, fontWeight: 700, fontSize: 18, textDecoration: 'none', display: 'inline-block' }}>Get Started Free</Link>
      </div>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '60px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, marginBottom: 40 }}>
          <div style={{ background: 'white', padding: 30, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍞</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: '0 0 12px' }}>For Merchants</h3>
            <p style={{ margin: 0 }}>List surplus food before it goes bad. Turn waste into revenue.</p>
          </div>
          <div style={{ background: 'white', padding: 30, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏭</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: '0 0 12px' }}>For Buyers</h3>
            <p style={{ margin: 0 }}>Get quality food at 50-80% off. Caterers, food banks, manufacturers.</p>
          </div>
          <div style={{ background: 'white', padding: 30, borderRadius: 12, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: '#15803d', margin: '0 0 12px' }}>For the Planet</h3>
            <p style={{ margin: 0 }}>Every dollar saved is food rescued. Join the zero-waste movement.</p>
          </div>
        </div>
        <div style={{ background: '#dcfce7', padding: 40, borderRadius: 12, textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>Live Marketplace</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 30 }}>
            <div><div style={{ fontSize: 40, fontWeight: 800, color: '#16a34a' }}>{stats.active_listings}</div><div>Active Listings</div></div>
            <div><div style={{ fontSize: 40, fontWeight: 800, color: '#16a34a' }}>{stats.total_merchants}</div><div>Merchants</div></div>
            <div><div style={{ fontSize: 40, fontWeight: 800, color: '#16a34a' }}>{stats.orders_completed}</div><div>Completed Orders</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ setUser }) {
  const [email, setEmail] = useState('baker@demo.com');
  const [password, setPassword] = useState('demo123');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await api.login({ email, password });
      localStorage.setItem(STORE_KEY, token);
      setUser(user);
      toast.success('Welcome back!');
      navigate('/browse');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Login to WasteZero</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} required />
          </div>
          <button type="submit" style={{ width: '100%', background: '#16a34a', color: 'white', padding: 12, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Login</button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>Don't have an account? <Link to="/signup" style={{ color: '#16a34a' }}>Sign up</Link></p>
        <div style={{ marginTop: 20, padding: 16, background: '#f0fdf4', borderRadius: 6, fontSize: 13 }}>
          <p style={{ fontWeight: 700, margin: '0 0 8px' }}>Demo Accounts:</p>
          <p style={{ margin: '4px 0' }}>Merchant: baker@demo.com / demo123</p>
          <p style={{ margin: '4px 0' }}>Buyer: cafe@demo.com / demo123</p>
        </div>
      </div>
    </div>
  );
}

function Signup({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, user } = await api.signup({ name, email, password, role });
      localStorage.setItem(STORE_KEY, token);
      setUser(user);
      toast.success('Account created!');
      navigate(role === 'merchant' ? '/create' : '/browse');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: 440 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Join WasteZero</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Your Name / Business</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} required />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} required />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>I want to...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button type="button" onClick={() => setRole('buyer')} style={{ padding: 12, border: role === 'buyer' ? '2px solid #16a34a' : '1px solid #d1d5db', background: role === 'buyer' ? '#f0fdf4' : 'white', borderRadius: 6, cursor: 'pointer' }}>
                <div style={{ fontWeight: 700 }}>Buy Food</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Find deals</div>
              </button>
              <button type="button" onClick={() => setRole('merchant')} style={{ padding: 12, border: role === 'merchant' ? '2px solid #16a34a' : '1px solid #d1d5db', background: role === 'merchant' ? '#f0fdf4' : 'white', borderRadius: 6, cursor: 'pointer' }}>
                <div style={{ fontWeight: 700 }}>Sell Food</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>List surplus</div>
              </button>
            </div>
          </div>
          <button type="submit" style={{ width: '100%', background: '#16a34a', color: 'white', padding: 12, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Create Account</button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>Already have an account? <Link to="/login" style={{ color: '#16a34a' }}>Login</Link></p>
      </div>
    </div>
  );
}

function Browse({ user }) {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.getListings().then(d => { setListings(d.listings || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  const filtered = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && l.category !== category) return false;
    return true;
  });
  const handleBuy = async (listing) => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      const res = await api.createPaymentIntent({ listing_id: listing.id, quantity: 1 });
      if (res.url) { window.location.href = res.url; return; }
      await api.createOrder({ listing_id: listing.id, quantity: 1 });
      toast.success('Order placed! Check your orders page.');
    } catch (err) {
      try {
        await api.createOrder({ listing_id: listing.id, quantity: 1 });
        toast.success('Order placed (demo)! Check orders page.');
      } catch (e2) { toast.error(e2.message || 'Failed'); }
    }
  };
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>Browse Surplus Food</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 30 }}>
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }}>
          <option value="">All Categories</option>
          <option value="baked">Baked Goods</option>
          <option value="prepared">Prepared Food</option>
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="other">Other</option>
        </select>
      </div>
      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {filtered.map(listing => (
            <div key={listing.id} style={{ background: 'white', padding: 20, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ height: 160, background: '#e5e7eb', borderRadius: 8, marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                {listing.category === 'baked' ? '🍞' : listing.category === 'prepared' ? '🍲' : listing.category === 'produce' ? '🥬' : '📦'}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px' }}>{listing.title}</h3>
              <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 12px' }}>{listing.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 20 }}>${listing.price}</span>
                <span style={{ color: '#6b7280', fontSize: 14 }}>{listing.quantity} available</span>
              </div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>📍 {listing.pickup_location}</div>
              <button onClick={() => handleBuy(listing)} style={{ width: '100%', background: '#16a34a', color: 'white', padding: 10, border: 'none', borderRadius: 6, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Buy Now</button>
            </div>
          ))}
        </div>
      )}
      {!loading && filtered.length === 0 && <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 40 }}>No listings found. Try different filters.</p>}
    </div>
  );
}

function CreateListing({ user }) {
  const [form, setForm] = useState({ title: '', description: '', price: '', quantity: '', category: 'baked', pickup_location: '' });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createListing({ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
      toast.success('Listing created!');
      navigate('/my-listings');
    } catch (err) { toast.error(err.message || 'Failed to create listing'); }
  };
  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>List Surplus Food</h1>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: 30, borderRadius: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Field label="Title" value={form.title} onChange={v => setForm({...form, title: v})} placeholder="e.g., Day-old sourdough bread" />
        <Field label="Description" value={form.description} onChange={v => setForm({...form, description: v})} placeholder="Describe the food..." textarea />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Field label="Price ($)" value={form.price} onChange={v => setForm({...form, price: v})} type="number" />
          <Field label="Quantity" value={form.quantity} onChange={v => setForm({...form, quantity: v})} type="number" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16 }}>
            <option value="baked">Baked Goods</option>
            <option value="prepared">Prepared Food</option>
            <option value="produce">Produce</option>
            <option value="dairy">Dairy</option>
            <option value="other">Other</option>
          </select>
        </div>
        <Field label="Pickup Location" value={form.pickup_location} onChange={v => setForm({...form, pickup_location: v})} placeholder="Address or area" />
        <button type="submit" style={{ width: '100%', background: '#16a34a', color: 'white', padding: 14, border: 'none', borderRadius: 6, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Create Listing</button>
      </form>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder, textarea }) {
  const style = { width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 16, marginBottom: 16, fontFamily: 'inherit' };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      {textarea ? <textarea value={value} onChange={e => onChange(e.target.value)} style={{ ...style, minHeight: 80 }} placeholder={placeholder} required /> : <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} placeholder={placeholder} required />}
    </div>
  );
}

function MyListings({ user }) {
  const [listings, setListings] = useState([]);
  useEffect(() => {
    api.getListings().then(d => setListings((d.listings || []).filter(l => l.merchant_id === user?.id))).catch(() => {});
  }, [user]);
  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.deleteListing(id);
      setListings(listings.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } catch (err) { toast.error('Failed to delete'); }
  };
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>My Listings</h1>
        <Link to="/create" style={{ background: '#16a34a', color: 'white', padding: '10px 20px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}>+ New Listing</Link>
      </div>
      {listings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12 }}>
          <p style={{ color: '#6b7280', marginBottom: 16 }}>No listings yet</p>
          <Link to="/create" style={{ color: '#16a34a' }}>Create your first listing</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {listings.map(l => (
            <div key={l.id} style={{ background: 'white', padding: 20, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{l.title}</h3>
                <p style={{ color: '#6b7280', margin: 0 }}>${l.price} • {l.quantity} left • {l.status}</p>
              </div>
              <button onClick={() => handleDelete(l.id)} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.getOrders().then(d => setOrders(d.orders || [])).catch(() => {}); }, []);
  const myOrders = orders.filter(o => o.buyer_id === user?.id || o.merchant_id === user?.id);
  const handleConfirm = async (id) => {
    try { await api.confirmOrder(id); toast.success('Order confirmed!'); setOrders(orders.map(o => o.id === id ? { ...o, status: 'paid' } : o)); }
    catch (err) { toast.error('Failed to confirm'); }
  };
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 24 }}>Orders</h1>
      {myOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, background: 'white', borderRadius: 12 }}>
          <p style={{ color: '#6b7280' }}>No orders yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {myOrders.map(o => (
            <div key={o.id} style={{ background: 'white', padding: 20, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{o.title || 'Order #' + o.id}</h3>
                <p style={{ color: '#6b7280', margin: 0, fontSize: 14 }}>Total: ${o.amount} • Status: <strong style={{ textTransform: 'capitalize' }}>{o.status}</strong></p>
              </div>
              {user?.role === 'merchant' && o.status === 'pending' && (
                <button onClick={() => handleConfirm(o.id)} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Confirm Payment</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const token = localStorage.getItem(STORE_KEY);
    if (token) {
      api.me().then(u => { setUser(u.user); setLoaded(true); }).catch(() => setLoaded(true));
    } else { setLoaded(true); }
  }, []);
  const handleLogout = () => { localStorage.removeItem(STORE_KEY); setUser(null); toast.success('Logged out'); };
  if (!loaded) return <div style={{ padding: 40, textAlign: 'center' }}>Loading WasteZero...</div>;
  const showNavbar = !['/', '/login', '/signup'].includes(location.pathname);
  return (
    <>
      {showNavbar && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/browse" element={<Browse user={user} />} />
        <Route path="/create" element={user?.role === 'merchant' ? <CreateListing user={user} /> : <Landing />} />
        <Route path="/my-listings" element={user ? <MyListings user={user} /> : <Landing />} />
        <Route path="/orders" element={user ? <Orders user={user} /> : <Landing />} />
      </Routes>
    </>
  );
}
