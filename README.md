# Trampet — Food Delivery Platform

Multi-restaurant food delivery platform for Kenya. Built with React + Vite.

## Quick Start

```bash
cd trampet
npm install
npm run dev
```

Open http://localhost:5173

## What's included in this starter kit

### Customer website (this app)
- Restaurant listings with city + cuisine filters
- Search by restaurant name, city, or cuisine
- Restaurant detail page with full menu
- Add to cart with quantity controls
- Cart drawer with order summary
- Checkout with M-Pesa STK Push or Cash on Delivery
- Order confirmation with live status tracker

### File structure
```
src/
  App.jsx              — Main app with page routing and cart state
  data/
    restaurants.js     — Restaurant + menu data (replace with your API)
  components/
    Header.jsx         — Sticky nav with cart button
    HeroSection.jsx    — Search bar + city/cuisine filters
    RestaurantGrid.jsx — Restaurant cards
    CartDrawer.jsx     — Slide-out cart panel
  pages/
    RestaurantPage.jsx — Full menu with add/remove items
    CheckoutPage.jsx   — Address + payment (M-Pesa / cash)
    OrderConfirmation  — Live order tracker
```

## Next steps to make it production-ready

### 1. Backend API
Replace `src/data/restaurants.js` with real API calls:
```js
// Example
const restaurants = await fetch("https://your-api.com/restaurants?city=Nairobi").then(r => r.json());
```

### 2. M-Pesa integration (Daraja API)
- Register at https://developer.safaricom.co.ke
- Get your Consumer Key, Consumer Secret, and Shortcode
- Implement STK Push on your backend
- Call it from CheckoutPage.jsx on order placement

### 3. Real-time order tracking
Replace the setTimeout simulation in OrderConfirmation.jsx with:
- Socket.io for live updates from your backend
- Or Firebase Realtime Database

### 4. WhatsApp Bot
- Register at https://developers.facebook.com/products/whatsapp/
- Connect to this same backend API
- Same order flow, via WhatsApp messages

### 5. Deployment
- Frontend: `npm run build` then deploy /dist to Vercel (free)
- Backend: Deploy to Railway or Render (free tier available)

## Tech stack
- React 18 + Vite
- No external UI library (fully custom design)
- Syne font (Google Fonts)
- Dark theme, mobile responsive

## Adding more restaurants
Edit `src/data/restaurants.js` — follow the same structure.
Each restaurant has: id, name, city, area, category, rating, reviews,
deliveryTime, deliveryFee, minOrder, image, logo, logoColor, open,
tags, description, and menu array.

---
Built with Trampet Starter Kit
