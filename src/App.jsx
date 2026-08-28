import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { api } from './api';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="bg-green-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">WasteZero</Link>
        <div className="space-x-4">
          {user ? (
            <>
              <Link to="/browse" className="hover:underline">Browse</Link>
              <Link to="/create" className="hover:underline">Sell Food</Link>
              <Link to="/my-listings" className="hover:underline">My Listings</Link>
              <Link to="/orders" className="hover:underline">Orders</Link>
              <span className="text-green-200">({user.role})</span>
              <button onClick={onLogout} className="bg-green-700 px-3 py-1 rounded hover:bg-green-800">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/signup" className="bg-white text-green-600 px-3 py-1 rounded hover:bg-green-100">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function Landing() {
  const [stats, setStats] = useState({ listings: 0, merchants: 0, orders: 0 });
  useEffect(() => {
    api.get('/api/stats').then(setStats).catch(() => {});
  }, []);
  return (
    <div className="min-h-screen bg-green-50">
      <div className="bg-green-600 text-white py-20 px-4 text-center">
        <h1 className="text-5xl font-bold mb-4">Stop Food Waste. Start Earning.</h1>
        <p className="text-xl mb-8">Connect surplus food from restaurants and bakeries to buyers who need it.</p>
        <Link to="/signup" className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-100">
          Get Started Free
        </Link>
      </div>
      <div className="container mx-auto py-16 px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🍞</div>
            <h3 className="text-xl font-bold mb-2">For Merchants</h3>
            <p>List surplus food before it goes bad. Turn waste into revenue.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🏭</div>
            <h3 className="text-xl font-bold mb-2">For Buyers</h3>
            <p>Get quality food at 50-80% off. Caterers, food banks, manufacturers.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-xl font-bold mb-2">For the Planet</h3>
            <p>Every dollar saved is food rescued. Join the zero-waste movement.</p>
          </div>
        </div>
        <div className="bg-green-100 p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Live Marketplace Stats</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div><div className="text-3xl font-bold text-green-600">{stats.listings}</div><div>Active Listings</div></div>
            <div><div className="text-3xl font-bold text-green-600">{stats.merchants}</div><div>Merchants</div></div>
            <div><div className="text-3xl font-bold text-green-600">{stats.orders}</div><div>Completed Orders</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { user } = await api.post('/api/auth/login', { email, password });
      setUser(user);
      toast.success('Welcome back!');
      navigate('/browse');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to WasteZero</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Login</button>
        </form>
        <p className="mt-4 text-center text-sm">Don't have an account? <Link to="/signup" className="text-green-600">Sign up</Link></p>
        <div className="mt-4 p-4 bg-green-50 rounded text-sm">
          <p className="font-bold">Demo Accounts:</p>
          <p>Merchant: baker@demo.com / demo123</p>
          <p>Buyer: cafe@demo.com / demo123</p>
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
      const { user } = await api.post('/api/auth/signup', { name, email, password, role });
      setUser(user);
      toast.success('Account created!');
      navigate(role === 'merchant' ? '/create' : '/browse');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    }
  };
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Join WasteZero</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name / Business</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">I want to...</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setRole('buyer')} className={`p-3 rounded border ${role === 'buyer' ? 'border-green-500 bg-green-50' : ''}`}>
                <div className="font-bold">Buy Food</div>
                <div className="text-sm text-gray-600">Find deals</div>
              </button>
              <button type="button" onClick={() => setRole('merchant')} className={`p-3 rounded border ${role === 'merchant' ? 'border-green-500 bg-green-50' : ''}`}>
                <div className="font-bold">Sell Food</div>
                <div className="text-sm text-gray-600">List surplus</div>
              </button>
            </div>
          </div>
          <input type="hidden" value={role} />
          <button type="submit" className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Create Account</button>
        </form>
        <p className="mt-4 text-center text-sm">Already have an account? <Link to="/login" className="text-green-600">Login</Link></p>
      </div>
    </div>
  );
}

function Browse({ user }) {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  useEffect(() => {
    api.get('/api/listings').then(data => setListings(data)).catch(console.error);
  }, []);
  const filtered = listings.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && l.category !== category) return false;
    return true;
  });
  const handleBuy = async (listing) => {
    if (!user) { toast.error('Please login first'); return; }
    try {
      await api.post('/api/orders', { listing_id: listing.id, quantity: 1 });
      toast.success('Order placed! Check your orders page.');
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    }
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Browse Surplus Food</h1>
      <div className="flex gap-4 mb-6">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 p-2 border rounded" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded">
          <option value="">All Categories</option>
          <option value="baked">Baked Goods</option>
          <option value="prepared">Prepared Food</option>
          <option value="produce">Produce</option>
          <option value="dairy">Dairy</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map(listing => (
          <div key={listing.id} className="bg-white p-4 rounded-lg shadow-md">
            <div className="h-40 bg-gray-200 rounded mb-4 flex items-center justify-center text-6xl">
              {listing.category === 'baked' ? '🍞' : listing.category === 'prepared' ? '🍲' : listing.category === 'produce' ? '🥬' : '📦'}
            </div>
            <h3 className="font-bold text-lg">{listing.title}</h3>
            <p className="text-gray-600 text-sm mb-2">{listing.description}</p>
            <div className="flex justify-between items-center mb-3">
              <span className="text-green-600 font-bold">${listing.price}</span>
              <span className="text-sm text-gray-500">{listing.quantity} available</span>
            </div>
            <div className="text-sm text-gray-500 mb-3">Pickup: {listing.pickup_location}</div>
            <button onClick={() => handleBuy(listing)} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
              Buy Now
            </button>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-center text-gray-500 mt-8">No listings found. Try different filters.</p>}
    </div>
  );
}

function CreateListing({ user }) {
  const [form, setForm] = useState({ title: '', description: '', price: '', quantity: '', category: 'baked', pickup_location: '', pickup_window: '' });
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/listings', { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
      toast.success('Listing created!');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.message || 'Failed to create listing');
    }
  };
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">List Surplus Food</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g., Day-old sourdough bread" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full p-2 border rounded" rows="3" placeholder="Describe the food..." required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price ($)</label>
            <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Quantity</label>
            <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full p-2 border rounded" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-2 border rounded">
            <option value="baked">Baked Goods</option>
            <option value="prepared">Prepared Food</option>
            <option value="produce">Produce</option>
            <option value="dairy">Dairy</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pickup Location</label>
          <input type="text" value={form.pickup_location} onChange={e => setForm({...form, pickup_location: e.target.value})} className="w-full p-2 border rounded" placeholder="Address or area" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Pickup Window</label>
          <input type="text" value={form.pickup_window} onChange={e => setForm({...form, pickup_window: e.target.value})} className="w-full p-2 border rounded" placeholder="e.g., Today 2-6 PM" required />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 font-bold">Create Listing</button>
      </form>
    </div>
  );
}

function MyListings({ user }) {
  const [listings, setListings] = useState([]);
  const [offers, setOffers] = useState([]);
  useEffect(() => {
    api.get('/api/listings').then(data => setListings(data.filter(l => l.seller_id === user?.id))).catch(console.error);
    api.get('/api/offers/listing/all').then(setOffers).catch(() => setOffers([]));
  }, [user]);
  const handleDelete = async (id) => {
    if (!confirm('Delete this listing?')) return;
    try {
      await api.delete(`/api/listings/${id}`);
      setListings(listings.filter(l => l.id !== id));
      toast.success('Listing deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link to="/create" className="bg-green-600 text-white px-4 py-2 rounded">+ New Listing</Link>
      </div>
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No listings yet</p>
          <Link to="/create" className="text-green-600 hover:underline">Create your first listing</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map(listing => (
            <div key={listing.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
              <div>
                <h3 className="font-bold">{listing.title}</h3>
                <p className="text-gray-600">${listing.price} • {listing.quantity} left • {listing.status}</p>
              </div>
              <button onClick={() => handleDelete(listing.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Orders({ user }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get('/api/orders').then(data => setOrders(data)).catch(console.error);
  }, []);
  const myOrders = orders.filter(o => o.buyer_id === user?.id || o.seller_id === user?.id);
  const handleConfirm = async (orderId) => {
    try {
      await api.post(`/api/orders/${orderId}/confirm`);
      toast.success('Order confirmed!');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'paid' } : o));
    } catch (err) {
      toast.error('Failed to confirm');
    }
  };
  const handleComplete = async (orderId) => {
    try {
      await api.put(`/api/orders/${orderId}/complete`);
      toast.success('Order completed!');
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    } catch (err) {
      toast.error('Failed to complete');
    }
  };
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Orders</h1>
      {myOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">Order #{order.id}</h3>
                  <p className="text-gray-600">Total: ${order.total}</p>
                  <p className="text-sm text-gray-500">Status: <span className="font-bold capitalize">{order.status}</span></p>
                </div>
                <div className="space-x-2">
                  {user?.role === 'merchant' && order.status === 'pending' && (
                    <button onClick={() => handleConfirm(order.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Confirm Payment</button>
                  )}
                  {user?.role === 'merchant' && order.status === 'paid' && (
                    <button onClick={() => handleComplete(order.id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Mark Complete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  useEffect(() => {
    api.get('/api/auth/me').then(setUser).catch(() => setUser(null));
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out');
  };
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
      <Toaster position="top-right" />
    </>
  );
}

export default App;
