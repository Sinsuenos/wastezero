# WasteZero Setup Guide

## Quick Start (48 Hour Deployment)

### Prerequisites
1. **Node.js** (v18+ recommended)
   ```bash
   # Windows
   winget install OpenJS.NodeJS
   
   # Or download from: https://nodejs.org/download/
   ```

2. **Stripe Account** (for payments)
   - Sign up at https://stripe.com
   - Get your secret key from Dashboard → Developers → API keys

### Installation Steps

1. **Clone/Copy the Repository**
   ```bash
   # If you have the files locally:
   cd wastezero
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Configure Environment**
   ```bash
   # Server
   cp server/.env.example server/.env
   # Edit .env with your Stripe keys
   
   # Frontend (optional - API proxy configured in vite.config.js)
   ```

4. **Initialize Database**
   ```bash
   cd server
   node index.js
   # This creates wastezero.db and seeds demo data
   # Press Ctrl+C after seeing "WasteZero API running on http://localhost:3001"
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd ../client
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:3001
   - Demo Login: baker@demo.com / demo123

### Production Deployment

#### Option 1: Vercel + Railway (Free Tiers)
1. **Backend (Railway)**
   - Push server code to GitHub
   - Connect to Railway, set environment variables
   - Add START_COMMAND: `node index.js`

2. **Frontend (Vercel)**
   - Push client code to GitHub
   - Connect to Vercel, it auto-detects Vite/React
   - Set API URL in vercel.json

#### Option 2: Docker (Single Command)
```bash
# Create docker-compose.yml
# Deploy to any cloud provider
```

### Features Included in 48 Hour MVP

✅ **User Authentication** (JWT-based)
✅ **Merchant/Buyer Roles**
✅ **Listing Management** (Create, browse, delete)
✅ **Offer/Negotiation System**
✅ **Order Flow** (Pending → Paid → Completed)
✅ **Payment Integration** (Stripe)
✅ **Basic Messaging**
✅ **Dashboard Stats**
✅ **Responsive Design** (Mobile-friendly)
✅ **Seed Data** for instant testing

### Revenue Model

- **Transaction Fee**: 12% of each sale (configurable in server/index.js)
- **Future Tiers**: Premium features, analytics, API access

### Customization for Your Needs

1. **Change Commission Rate**
   - Edit `PLATFORM_FEE_PCT` in server/index.js

2. **Add Categories**
   - Update category arrays in client/src/App.jsx

3. **Modify Pickup Logic**
   - Add calendar integration or time slot booking

4. **Enhanced Messaging**
   - Add file attachments, read receipts

5. **Analytics Dashboard**
   - Extend /api/stats endpoint

### Security Notes (For Production)

1. **Environment Variables**
   - Never commit .env to git
   - Use platform secret management

2. **Rate Limiting**
   - Add express-rate-limit to prevent abuse

3. **Input Validation**
   - Add Joi or Zod validation layer

4. **HTTPS**
   - Enable in production (Vercel/Railway handle this)

### Troubleshooting

- **Database Errors**: Delete wastezero.db and restart server to reseed
- **Port Conflicts**: Change PORT in .env or vite.config.js
- **CORS Issues**: Ensure vite.config.js proxy matches backend URL
- **Stripe Test Mode**: Use test cards: 4242 4242 4242 4242

### Next Steps Beyond 48 Hours

1. **Geolocation Features** (map-based pickup)
2. **Scheduled Pickups** (calendar integration)
3. **Bulk Operations** (for large distributors)
4. **Quality Ratings** (buyer ratings of food quality)
5. **Tax Documentation** (automated receipts for donors)
6. **Mobile App** (React Native)
7. **AI Demand Forecasting** (predict what will sell fast)

---

**You're live!** Start making an impact reducing food waste while generating revenue from surplus inventory.

🌱 **WasteZero** - Where surplus meets opportunity.