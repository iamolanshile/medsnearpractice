# MedsNear

Nigeria drug availability platform — agent inventory uploads + WhatsApp customer chatbot.

## Project Structure

```
medsnear/
├── backend/                  ← Node.js API server
│   ├── src/
│   │   ├── index.js          ← Express entry point
│   │   ├── lib/
│   │   │   └── supabase.js   ← Supabase client
│   │   ├── middleware/
│   │   │   └── auth.js       ← JWT auth middleware
│   │   ├── routes/
│   │   │   ├── agent.js      ← Agent auth + inventory APIs
│   │   │   ├── admin.js      ← Admin dashboard APIs
│   │   │   └── whatsapp.js   ← WhatsApp webhook
│   │   └── services/
│   │       ├── inventory.js  ← Geo search logic
│   │       ├── payout.js     ← Payout calculation
│   │       └── whatsapp.js   ← Bot conversation state machine
│   ├── scripts/
│   │   └── create-admin.js   ← One-time admin seed script
│   ├── supabase/
│   │   ├── schema.sql        ← Full DB schema
│   │   └── disable_rls.sql   ← Disable RLS for backend-only access
│   ├── public/
│   │   └── consent-form.html ← Downloadable pharmacy consent form
│   ├── .env                  ← Environment variables (git-ignored)
│   ├── .env.example          ← Env template
│   └── package.json
│
├── frontend/                 ← Static HTML + Vanilla JS
│   ├── agent/
│   │   ├── index.html        ← Agent mobile app
│   │   └── assets/
│   │       ├── agent.js      ← Agent app logic
│   │       └── nigeria-lga.js← All 36 states + LGAs data
│   ├── admin/
│   │   ├── index.html        ← Admin dashboard
│   │   └── assets/
│   │       └── admin.js      ← Admin dashboard logic
│   └── package.json
│
└── README.md
```

## Quick Start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your Supabase + Twilio credentials in .env
npm run dev
```

Backend runs on `http://localhost:3000`

### 2. Frontend

Open the HTML files directly in a browser, or serve them:

```bash
cd frontend
npx serve . -p 8080
```

- Agent app: `http://localhost:8080/agent/`
- Admin dashboard: `http://localhost:8080/admin/`

> In production, point the frontend API calls to your deployed backend URL.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `backend/supabase/schema.sql` in the SQL editor
3. Run `backend/supabase/disable_rls.sql` to disable RLS (backend controls access)
4. Create two storage buckets:
   - `medication-photos` (public)
   - `agent-docs` (public)
5. Copy your project URL + service role key into `backend/.env`

## WhatsApp Setup (Twilio)

Set your Twilio WhatsApp webhook to:
```
https://your-backend-domain.com/api/whatsapp/webhook
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/agent/register` | Agent registration |
| POST | `/api/agent/login` | Agent login |
| GET | `/api/agent/dashboard` | Agent stats + earnings |
| GET/POST | `/api/agent/pharmacies` | Search / add pharmacy |
| POST | `/api/agent/inventory` | Upload drug inventory |
| POST | `/api/agent/verify` | Submit ID document |
| POST | `/api/agent/consent` | Upload consent form |
| POST | `/api/admin/setup` | First-time admin setup |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/analytics` | Platform stats |
| GET | `/api/admin/orders` | All orders |
| GET | `/api/admin/agents` | Agent management |
| GET | `/api/admin/verifications` | ID verification queue |
| GET | `/api/admin/payouts` | Monthly payout data |
| GET | `/api/admin/settings` | Platform settings |
| POST | `/api/whatsapp/webhook` | WhatsApp bot webhook |

## Payout Tiers

- ₦50 per upload (configurable in Settings)
- ₦1,000 bonus at 50+ uploads/month
- ₦2,000 bonus at 100+ uploads/month
# medsnearpractice
