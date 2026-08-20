# Vistaro — Full MERN Stack Vacation Rental Platform

Vistaro is a full-stack MERN (MongoDB, Express, React, Node.js) web application for discovering, booking, and hosting unique vacation properties around the globe.

---

## 🌟 Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (Tailwind v4)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v7)
- **State & Contexts**: React Context API (`AuthContext`, `CurrencyContext`, `ToastContext`, `SocketContext`)
- **Maps**: Leaflet + OpenStreetMap
- **Real-Time Client**: Socket.io-client
- **HTTP Client**: Axios with credentialed sessions

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database & ODM**: MongoDB with Mongoose
- **Session Store**: `express-session` backed by `connect-mongo`
- **Authentication**: Passport.js (Local Strategy + Google OAuth 2.0)
- **File Uploads**: Multer + Cloudinary Storage
- **Geocoding**: Geoapify Geocoding API
- **Real-Time WebSockets**: Socket.io
- **Emails**: Nodemailer (HTML booking confirmations and refund receipts)
- **Security & Validation**: Joi schema validation, HTML sanitization against XSS, `express-mongo-sanitize`, and IP rate limiting

---

## 📁 Repository Structure

```
VISTARO/
├── client/                     # React + Vite + Tailwind Frontend
│   ├── public/                 # Public assets & favicon
│   ├── src/
│   │   ├── api/                # Axios REST API Client modules
│   │   ├── components/
│   │   │   ├── booking/        # Booking widget & price calculator
│   │   │   ├── common/         # Star rating, spinners, toast alerts
│   │   │   ├── layout/         # Navbar, mobile bottom nav, footer
│   │   │   ├── listings/       # Cards, category bar, filter modal, lightbox, maps
│   │   │   └── reviews/        # Review cards & submission forms
│   │   ├── context/            # Auth, Currency, Toast, and Socket contexts
│   │   ├── pages/              # Route pages (Home, Details, Create, Edit, Wishlist, Profile, Dashboard, Inbox, Auth)
│   │   ├── App.jsx             # Main router and provider wrapper
│   │   ├── index.css           # Tailwind configuration & design tokens
│   │   └── main.jsx            # React root mount
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Express REST API & WebSockets Backend
│   ├── config/                 # Database & Cloudinary configuration
│   ├── controllers/            # REST controllers (auth, listings, bookings, reviews, search, wishlist, dashboard, inbox)
│   ├── middleware/             # Auth guards, Joi validation, Multer uploads, rate limiters
│   ├── models/                 # Mongoose schemas (Listing, User, Review, Booking, Conversation, Message)
│   ├── routes/                 # Express API routes mounted under /api/*
│   ├── utils/                  # Async wrappers, error classes, currency helpers, email senders
│   └── server.js               # Express server entry point & Socket.io server
│
├── .env.example                # Documented template for all environment variables
├── package.json                # Root package with concurrent dev scripts
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js >= 20.0.0
- MongoDB instance (MongoDB Atlas connection string or local MongoDB)

### 2. Environment Setup
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your credentials (`ATLAS_DB_URL`, `SESSION_SECRET`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`, `GEOAPIFY_API_KEY`).

### 3. Install Dependencies
```bash
# Install root backend dependencies
npm install

# Install client frontend dependencies
cd client
npm install
cd ..
```

### 4. Running Locally
Run both the Express API backend (port 3003) and the React Vite frontend (port 5173) concurrently:
```bash
npm run dev
```

You can now access:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3003/api/health](http://localhost:3003/api/health)

- `npm run server` — Runs backend server only.
- `npm run client` — Runs Vite frontend only.
- `npm run build` — Installs client dependencies and builds production bundle in `client/dist`.
- `npm start` — Starts the production Node.js server (serves API and `client/dist` static assets).

### 6. Deployment (Render / Heroku / Railway)
* **Build Command**: `npm run build` (or `npm install && npm run build`)
* **Start Command**: `node server/server.js` (or `npm start` or `node app.js`)
* **Environment Variables**: Add all variables from `.env.example` in your hosting dashboard.

---

## 🔑 Key Features
1. **Explore & Category Browsing**: Search destinations, filter by categories (Beach, Farm, OMG, Arctic, Lake, Bed & Breakfast, Trending), apply price bounds and amenity filters.
2. **Multi-Image Listing Management**: Upload up to 5 photos per listing with automatic Cloudinary storage, automated coordinate geocoding via Geoapify, and interactive Leaflet map rendering.
3. **Interactive Reservations & Email Receipts**: Live date conflict checking, 18% GST calculation, automatic reservation confirmation email receipts, and tiered cancellation refund policies.
4. **Wishlist & Social Sharing**: One-click heart save with instant reactive feedback and native Web Share API integration.
5. **Two-Way Review System**: 5-star rating system with verified review deletion and host response threads.
6. **Real-Time Host-Guest Chat**: Split-pane inbox powered by Socket.io WebSockets with live message delivery and unread indicators.
7. **Host Analytics Dashboard**: Tracks property count, total revenue, upcoming guests, and 30-day occupancy rates.
8. **Multi-Currency Support**: Switch on-the-fly between INR (₹), USD ($), EUR (€), GBP (£), and AED with dynamic formatting.
9. **Responsive Design**: Designed for both desktop viewports and mobile devices with persistent bottom navigation tabs.
