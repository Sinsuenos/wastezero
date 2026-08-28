const BASE = '/api';

const getToken = () => localStorage.getItem('wastezero_token');

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  // Auth
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),

  // Listings
  getListings: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/listings${q ? '?' + q : ''}`);
  },
  getListing: (id) => request(`/listings/${id}`),
  createListing: (body) => request('/listings', { method: 'POST', body: JSON.stringify(body) }),
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE' }),
  getMyListings: (id) => request(`/listings/merchant/${id}`),

  // Offers
  createOffer: (body) => request('/offers', { method: 'POST', body: JSON.stringify(body) }),
  getListingOffers: (id) => request(`/offers/listing/${id}`),
  getMyOffers: (id) => request(`/offers/buyer/${id}`),
  updateOffer: (id, body) => request(`/offers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Orders
  createOrder: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
  confirmOrder: (id) => request(`/orders/${id}/confirm`, { method: 'POST' }),
  completeOrder: (id) => request(`/orders/${id}/complete`, { method: 'PUT' }),
  getMyOrders: (id) => request(`/orders/user/${id}`),

  // Messages
  sendMessage: (body) => request('/messages', { method: 'POST', body: JSON.stringify(body) }),
  getMessages: (threadId) => request(`/messages/${threadId}`),

  // Stats
  getStats: () => request('/stats'),
};
