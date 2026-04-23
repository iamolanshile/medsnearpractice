# 🚀 MedsNear Quick Start Guide

## Step 1: Install Dependencies

```bash
# From the root directory
npm run install:all
```

This will install dependencies for both backend and frontend.

---

## Step 2: Start the Backend

Open a terminal and run:

```bash
npm run dev:backend
```

You should see:
```
✅ MongoDB connected successfully
🚀 MedsNear backend running on http://localhost:3000
```

**Note:** The MongoDB connection is already configured in `backend/.env` with your credentials.

---

## Step 3: Start the Frontend

Open a **new terminal** and run:

```bash
npm run dev:frontend
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

---

## Step 4: Access the App

### Landing Page
Open http://localhost:5173 in your browser.

You'll see the beautiful landing page with:
- Hero section with WhatsApp mockup
- How it works for patients
- How it works for agents
- Earnings calculator
- Application form

### Create Admin Account
1. Go to http://localhost:5173/admin/login
2. Click "First time? Create account"
3. Enter:
   - Email: `admin@medsnear.com`
   - Password: `admin123`
4. Click "Create account"
5. Login with your credentials

### Agent Registration
1. Go to http://localhost:5173/agents
2. Scroll to the application form
3. Fill out the form
4. Submit

The agent will be created with status `pending`. You'll need to approve them from the admin dashboard.

### Agent Login
1. Go to http://localhost:5173/agent/login
2. Use the email and phone number from registration
3. Password is temporarily set to the phone number

---

## 🎯 What You Can Do Now

### As Admin:
- View platform analytics
- See all orders, agents, and pharmacies
- Approve/suspend agents
- Monitor inventory uploads

### As Agent:
- Upload pharmacy inventory
- Track monthly uploads
- See projected earnings
- View upload history

---

## 📁 Key Files

- **Backend entry**: `backend/server.js`
- **Frontend entry**: `frontend/src/main.jsx`
- **Landing page**: `frontend/src/pages/public/Landing.jsx`
- **Agent dashboard**: `frontend/src/pages/agent/Dashboard.jsx`
- **Admin dashboard**: `frontend/src/pages/admin/Dashboard.jsx`

---

## 🎨 Design System

The app uses a consistent design inspired by your existing admin panel:

**Colors:**
- Primary: `#00478d` (Blue)
- Surface: `#f9f9fc` (Light background)
- Fonts: Inter (headings/body), Public Sans (labels)

**Components:**
- All buttons, inputs, cards follow the same style
- Badges for status indicators
- Responsive mobile-first design

---

## 🔧 Troubleshooting

### Backend won't start
- Check MongoDB connection string in `backend/.env`
- Ensure MongoDB Atlas allows connections from your IP

### Frontend won't start
- Delete `frontend/node_modules` and run `npm install` again
- Check that port 5173 is not in use

### Can't login
- Make sure backend is running on port 3000
- Check browser console for errors
- Verify `.env` files are in place

---

## 🚢 Next Steps

1. **Test the full flow**: Register agent → Admin approves → Agent uploads → View in admin dashboard
2. **Customize**: Update colors, fonts, copy to match your brand
3. **Deploy**: 
   - Backend: Railway, Render, or Heroku
   - Frontend: Vercel or Netlify

---

## 📞 Need Help?

Check the main `README.md` for full documentation, API endpoints, and deployment guides.

Happy building! 🎉
