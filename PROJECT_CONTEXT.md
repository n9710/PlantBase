# VanaRoots — Plant-Based Marketplace

## Stack
- Frontend: React + Vite + Tailwind CSS (port 5174)
- Backend: Node.js + Express (port 5000)
- Database: MongoDB (local) — db name: vanaroots

## Project Location
C:\Users\Dell\OneDrive\Desktop\plantbase(claud.ai)\vanaroots\

## Structure
vanaroots/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js     ← exports { protect, admin, seller }
│   ├── models/User.js
│   ├── models/Product.js
│   ├── models/Order.js
│   ├── routes/auth.js
│   ├── routes/products.js
│   ├── routes/orders.js
│   ├── routes/admin.js
│   ├── utils/token.js
│   ├── seed.js
│   ├── server.js
│   └── .env                  ← MONGO_URI, JWT_SECRET, PORT=5000
└── frontend/
    ├── src/
    │   ├── api.js             ← axios baseURL: localhost:5000/api
    │   ├── context/AuthContext.jsx
    │   ├── context/CartContext.jsx
    │   ├── pages/Home.jsx
    │   ├── pages/Products.jsx
    │   ├── pages/ProductDetail.jsx
    │   ├── pages/Cart.jsx
    │   ├── pages/Login.jsx
    │   ├── pages/Register.jsx
    │   ├── pages/Admin.jsx
    │   └── pages/SellerDashboard.jsx
    └── .env                   ← VITE_API_URL=http://localhost:5000/api

## Test Accounts (seeded in MongoDB)
- Admin:    admin@vanaroots.com    / admin123
- Seller 1: greenroots@vanaroots.com / seller123
- Seller 2: tribal@vanaroots.com    / seller123
- Seller 3: kerala@vanaroots.com    / seller123
- Customer: customer@vanaroots.com  / customer123

## Features Built
- User auth (JWT) — register, login, logout
- Role-based: customer / seller / admin
- Products from MongoDB with filters, search, sort
- Seller submits product → admin approves/rejects
- Cart (context, no DB needed)
- Orders saved to MongoDB
- Admin dashboard: stats, pending approvals, orders, users
- Seller dashboard: add/edit/delete products, view orders
- Dark/light mode toggle
- 12 seeded products + 1 pending for testing

## Known Issues Being Fixed
- CORS issue between frontend (5174) and backend (5000)
- Register/Login API connection

## To Run
Terminal 1: cd backend && npm run dev
Terminal 2: cd frontend && npm run dev
Seed DB:    cd backend && npm run seed