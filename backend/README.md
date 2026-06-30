# MedsNear

**Find Your Medication. Anywhere in Nigeria.**

MedsNear is a web platform + WhatsApp chatbot that connects Nigerians to nearby pharmacy drug availability, powered by independent field agents who collect and upload real-time pharmacy inventory.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# Install all dependencies
npm run install:all

# Or install separately
npm run install:backend
npm run install:frontend
```

### Environment Setup

**Backend** (`backend/.env`):
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/medsnear?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### Running the App

```bash
# Terminal 1: Start backend
npm run dev:backend

# Terminal 2: Start frontend
npm run dev:frontend
```

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

---

## 📁 Project Structure

```
medsnear/
├── backend/                    # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/            # Database connection
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   └── services/          # Business logic
│   ├── server.js              # Entry point
│   └── package.json
│
├── frontend/                   # React 18 + Vite + Tailwind
│   ├── src/
│   │   ├── assets/            # Styles
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React Context (Auth)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── router.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── package.json               # Root monorepo scripts
```

---

## 🎯 Features

### For Patients (WhatsApp)
- Search for medication by name
- See nearby pharmacies with stock, price, and distance
- Place orders and pay via bank transfer
- Track delivery status

### For Agents (Web Dashboard)
- Upload pharmacy inventory (drug name, price, stock, expiry)
- Track monthly uploads and earnings
- Tiered payout system (₦150–₦200 per upload)
- Flexible work schedule

### For Admins (Web Dashboard)
- View platform analytics
- Manage agents and pharmacies
- Monitor orders
- Approve monthly payouts

---

## 🛠 Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

---

## 🔐 Default Admin Setup

On first run, create an admin account:

1. Go to http://localhost:5173/admin/login
2. Click "First time? Create account"
3. Enter email and password
4. Login with your credentials

---

## 📝 API Endpoints

### Agent Routes (`/api/agent`)
- `POST /register` - Register new agent
- `POST /login` - Agent login
- `GET /dashboard` - Agent dashboard data
- `GET /pharmacies` - Search pharmacies
- `POST /pharmacies` - Add new pharmacy
- `POST /inventory` - Upload inventory
- `GET /inventory/history` - Upload history

### Admin Routes (`/api/admin`)
- `POST /setup` - First-time admin setup
- `POST /login` - Admin login
- `GET /analytics` - Platform analytics
- `GET /agents` - List all agents
- `PATCH /agents/:id` - Update agent status
- `GET /orders` - List all orders
- `GET /pharmacies` - List all pharmacies
- `GET /payouts` - Monthly payout overview

---

## 🎨 Design System

The app uses a consistent design system based on Material Design 3 principles:

**Colors:**
- Primary: `#00478d` (Blue)
- Surface: `#f9f9fc` (Light gray)
- On-surface: `#1a1c1e` (Dark gray)

**Typography:**
- Headings: Inter (Black, 900)
- Body: Inter (Regular, 400–600)
- Labels: Public Sans (Bold, 700)

**Components:**
- Buttons: `.btn-primary`, `.btn-outline`, `.btn-ghost`
- Inputs: `.input-field`
- Cards: `.card`
- Badges: `.badge-green`, `.badge-yellow`, `.badge-red`, etc.

---

## 🚢 Deployment

### Backend (Railway, Render, Heroku)
1. Set environment variables
2. Deploy from GitHub
3. Ensure MongoDB connection string is correct

### Frontend (Vercel, Netlify)
1. Build: `npm run build`
2. Deploy `frontend/dist` folder
3. Set `VITE_API_URL` to your backend URL

---

## 📄 License

© 2025 MedsNear. Made with care in Nigeria.

---

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.
# MedsnearWeb
