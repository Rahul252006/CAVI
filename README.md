# CAVI — Customer Assistance through Voice Intelligence

> **Production-Grade Separated Frontend & Backend Architecture**
> 
> Real-time multilingual voice AI customer support platform with dynamic Company Brain knowledge compilation, intelligent officer escalation, Case DNA brief generation, and native Agora Conversational AI & WebRTC integration.

---

## 🏛️ System Architecture

```
CAVI/
│
├── frontend/                          # Next.js 14 / React 19 Frontend (Vercel)
│   ├── app/                           # App Router pages (Landing, Admin, Officer, Call, Dashboard)
│   ├── components/                    # UI Components (CaseDNA, MicButton, FloatingNavbar, etc.)
│   ├── lib/
│   │   ├── api/                       # Centralized API client (communicates via NEXT_PUBLIC_API_URL)
│   │   │   ├── client.ts              # Base fetch wrapper with error normalization
│   │   │   ├── auth.ts                # Admin & Officer login/signup
│   │   │   ├── companies.ts           # Company onboarding & Company Brain
│   │   │   ├── calls.ts               # Call lifecycle & phone number matching
│   │   │   ├── cases.ts               # Real-time Case DNA handoff queries
│   │   │   ├── agents.ts              # Human officer queues & outbound dialer
│   │   │   └── agora.ts               # Token acquisition & agent invitation
│   │   ├── agora/                     # Agora WebRTC client SDK
│   │   ├── echosphere/                # Client state, emotion, and language detector
│   │   └── utils.ts
│   ├── public/                        # Static assets (images, audio icons)
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── .env.example
│
├── backend/                           # Standalone Node.js / Express / TypeScript API (Render/Railway)
│   ├── src/
│   │   ├── config/                    # Environment, CORS, Port, and Secrets validation
│   │   ├── controllers/               # Auth, Company, Call, Case, Agora, Action, Telephony
│   │   ├── routes/                    # RESTful endpoints (/api/auth, /api/companies, /api/calls, etc.)
│   │   ├── services/                  # Business logic & Company Brain compilation
│   │   ├── models/                    # Typed MongoDB models & database access
│   │   ├── middleware/                # Dynamic CORS, request logger, error handling
│   │   ├── integrations/
│   │   │   ├── mongodb/               # MongoDB native driver client pool
│   │   │   └── agora/                 # Token generator & Conversational AI prompt injector
│   │   ├── app.ts                     # Express application definition
│   │   └── server.ts                  # Server bootstrap & DB connection
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── pnpm-workspace.yaml                # Monorepo workspace configuration
├── package.json                       # Root orchestration scripts
└── README.md
```

---

## 🔒 Security & Separation of Concerns

1. **Frontend (`frontend/`):**
   - Contains **zero** database credentials, API secrets, or Agora App Certificates.
   - Communicates with the backend solely through `NEXT_PUBLIC_API_URL`.
   - Optimized for instant deployment on **Vercel**.

2. **Backend (`backend/`):**
   - Securely isolates MongoDB connection, Agora App Certificate, and Conversational AI API credentials.
   - Enforces strict multi-tenant isolation by destination phone number (`supportPhone → companyId`).
   - Configurable CORS allowed origins to accept requests only from trusted frontend domains.

---

## 🚀 Quickstart (Local Development)

### 1. Prerequisites
- **Node.js** >= 20.x
- **pnpm** >= 9.x
- **MongoDB** (Local or MongoDB Atlas)

### 2. Clone & Install Dependencies
```bash
git clone https://github.com/Rahul252006/CAVI.git
cd CAVI
pnpm install
```

### 3. Configure Environment Variables

#### Backend Configuration (`backend/.env.local`):
```env
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# MongoDB URI
MONGODB_URI=mongodb://127.0.0.1:27017/echosphere

# Agora Server Credentials (Private)
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
AGORA_CONVERSATIONAL_AI_API_KEY=your_agora_api_key
AGORA_AGENT_ID=your_agent_preset_id

# JWT & Session
JWT_SECRET=your_super_secret_jwt_key
```

#### Frontend Configuration (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_AGORA_APP_ID=your_agora_app_id
NEXT_PUBLIC_AGORA_AGENT_ID=your_agent_preset_id
```

### 4. Run Both Services in Development Mode
```bash
# Run both Frontend (port 3000) and Backend (port 4000) concurrently:
pnpm dev

# Or run them in separate terminals:
pnpm dev:backend   # Starts Express API at http://localhost:4000
pnpm dev:frontend  # Starts Next.js UI at http://localhost:3000
```

---

## 📦 Production Deployment Guide

### 1. Deploy Backend (Render / Railway / Fly.io / AWS)

1. Connect your GitHub repository to **Render** or **Railway**.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command**:
   ```bash
   pnpm install && pnpm build
   ```
4. Set the **Start Command**:
   ```bash
   pnpm start
   ```
5. Configure Environment Variables on Render/Railway:
   - `PORT=4000`
   - `NODE_ENV=production`
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
   - `MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cavi`
   - `AGORA_APP_ID=...`
   - `AGORA_APP_CERTIFICATE=...`
   - `AGORA_CONVERSATIONAL_AI_API_KEY=...`
   - `AGORA_AGENT_ID=...`
   - `JWT_SECRET=...`

---

### 2. Deploy Frontend (Vercel)

1. Import your GitHub repository into **Vercel**.
2. In Project Settings, set the **Root Directory** to `frontend`.
3. Framework Preset: **Next.js**.
4. Configure Environment Variables on Vercel:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
   - `NEXT_PUBLIC_AGORA_APP_ID=...`
   - `NEXT_PUBLIC_AGORA_AGENT_ID=...`
5. Click **Deploy**. Vercel will build and deploy the Next.js frontend with zero server secret requirements.

---

## 🔌 Backend REST API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/admin/signup` | Register new company and administrative account |
| `POST` | `/api/auth/admin/login` | Authenticate company admin |
| `POST` | `/api/auth/agent/register` | Register human resolution officer |
| `POST` | `/api/auth/agent/login` | Authenticate human officer |
| `GET` | `/api/companies` | List all companies or query by `?phone=` |
| `GET` | `/api/companies/:companyId` | Retrieve company profile & status |
| `GET` | `/api/companies/:companyId/overview` | Admin dashboard analytics & stats |
| `GET` | `/api/companies/:companyId/brain` | Retrieve Company Brain rules, SOPs & FAQs |
| `POST` | `/api/companies/:companyId/config` | Update Company Brain AI boundaries |
| `POST` | `/api/companies/:companyId/knowledge` | Add knowledge document (FAQ, SOP, policy) |
| `DELETE`| `/api/companies/:companyId/knowledge/:id`| Remove knowledge document |
| `POST` | `/api/calls/start` | Resolve tenant by phone & initialize Agora channel |
| `GET` | `/api/calls?companyId=` | List call records for company |
| `GET` | `/api/calls/:callId` | Get individual call record and transcript |
| `GET` | `/api/cases?companyId=` | Query real-time Case DNA handoff briefs |
| `POST` | `/api/cases/create` | Persist or update Case DNA record |
| `POST` | `/api/agora/token` | Generate secure Agora RTC token |
| `POST` | `/api/agora/invite-agent` | Dispatch Conversational AI agent into channel |
| `POST` | `/api/action/refund` | Process autonomous policy-checked refund |
| `POST` | `/api/action/lookup` | Query order / transaction status |
| `POST` | `/api/action/analyze` | Real-time sentiment & frustration analysis |
| `POST` | `/api/telephony/inbound` | PSTN/SIP carrier inbound webhook |
| `POST` | `/api/telephony/outbound` | Human officer outbound click-to-dial |

---

## 📄 License
MIT License. Built for seamless, zero-repeat customer assistance through voice intelligence.
