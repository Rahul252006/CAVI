# CAVI — Customer Assistance through Voice Intelligence

<div align="center">

**AI-powered customer assistance, built for every conversation. Designed for resolution.**

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Agora](https://img.shields.io/badge/Agora-Conversational_AI-099DFD?style=for-the-badge&logo=agora)](https://www.agora.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[**Live Demo**](http://localhost:3000) • [**Customer Calling Line**](http://localhost:3000/call) • [**Officer Portal**](http://localhost:3000/agent/login) • [**Company Admin**](http://localhost:3000/admin/login) • [**Documentation**](http://localhost:3000/docs)

</div>

---

## 🌟 Overview

**CAVI** (*Customer Assistance through Voice Intelligence*) is an enterprise-grade, real-time voice resolution platform. It connects a company's dedicated support phone line to custom knowledge bases, operational policies, and verified API toolchains.

Instead of traditional IVR mazes or generic chatbots, CAVI listens to customers speaking naturally, handles interruptions seamlessly, verifies critical details, executes authorized API actions, and—when human judgement is needed—escalates the case to the right human officer with **Case DNA** (a full context brief) so the caller never repeats their story.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │                 Customer Calls In                       │
                  │   (Speaks naturally in Hindi / English / Code-Switched) │
                  └────────────────────────────┬────────────────────────────┘
                                               │
                                               ▼
                              ┌───────────────────────────────────┐
                              │      CAVI Voice Intelligence       │
                              │  (VAD Interruption / Confidence)  │
                              └────────────────┬──────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
          [Confidence High & Policy Match]                 [Low Confidence / Dispute]
                       │                                               │
                       ▼                                               ▼
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │   Automated Voice Action      │               │   Context-Preserving Handoff  │
       │   - Knowledge Resolution      │               │   - Case DNA Generated        │
       │   - Secure API Execution      │               │   - Routed to Right Officer   │
       │   - Verification & Receipt    │               │   - Zero Repeat Conversation  │
       └───────────────────────────────┘               └───────────────────────────────┘
```

---

## ✨ Core Features

### 🎙️ 1. Ultra-Low-Latency Conversational Voice
- **Agora WebRTC Audio Pipeline:** Sub-400ms end-to-end voice latency for real-time natural interaction.
- **Multilingual & Code-Switching:** Seamlessly understands callers switching between Hindi, English, and regional languages in the same sentence.
- **Natural Interruption Handling:** Active Voice Activity Detection (VAD) stops AI speech instantly when the caller speaks.
- **Background Noise Resilience:** Tuned for noisy environments, crowds, and imperfect audio inputs.

### 🧠 2. Isolated Multi-Tenant "Company Brain"
- **Zero Hallucination Guardrails:** Agents answer strictly from company-uploaded knowledge documents and SOP policies.
- **Action Verification Rules:** Configurable thresholds for automated refunds, booking edits, and account modifications.
- **Safety Boundaries:** Built-in safeguards prohibiting unauthorized claims, speculative promises, and sensitive operations.

### 🧬 3. Case DNA & Human Escalation
- **Zero-Repeat Philosophy:** Generates structured Case DNA summarizing intent, verified details, attempted resolutions, and emotional state.
- **Intelligent Officer Routing:** Transfers complex or sensitive calls directly to active human officers based on department and specialty.
- **Live Officer Dashboard:** Real-time synchronized queue with live sentiment, health score metrics, and transcript feeds.

### 🗄️ 4. Persistent MongoDB Storage
- **Isolated Tenant Models:** Dedicated collections for companies, knowledge documents, brain configurations, officer accounts, call records, and tool configs.
- **Real-Time Synchronized State:** Fallback persistence guarantees high availability and data integrity.

---

## 🏗️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript |
| **Styling** | Vanilla Tailwind CSS, Lora Typography, Glassmorphic Tokens |
| **Voice Engine** | Agora RTC Engine & Agora Conversational AI SDK |
| **Database** | MongoDB & Native Driver (`mongodb`) |
| **Icons** | Lucide React |
| **Deployment** | Vercel / Node.js Standalone Container |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **pnpm**: `npm install -g pnpm`
- **MongoDB**: Running instance (`mongodb://127.0.0.1:27017` or MongoDB Atlas URI)
- **Agora Account**: Agora App ID and Conversational AI credentials ([agora.io](https://www.agora.io/))

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Rahul252006/CAVI.git
cd CAVI
pnpm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
AGORA_APP_ID=your_agora_app_id
AGORA_APP_CERTIFICATE=your_agora_app_certificate
AGORA_CONVERSATIONAL_AI_API_KEY=your_conversational_ai_api_key
NEXT_PUBLIC_AGORA_AGENT_ID=your_agent_preset_id
MONGODB_URI=mongodb://127.0.0.1:27017/echosphere
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start the Application
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
.
├── app/
│   ├── layout.tsx                     # Root layout with Lora typography & global styles
│   ├── globals.css                    # Design tokens, smooth scrolling, and glassmorphism
│   ├── page.tsx                       # Landing page entry
│   ├── call/                          # Customer Calling Support Line
│   ├── agent/                         # Human Officer login, registration & portal
│   ├── admin/                         # Company Owner onboarding & admin portal
│   ├── dashboard/                     # Company overview & live call analytics
│   ├── docs/                          # Official architecture & developer docs
│   ├── about/                         # About CAVI platform
│   ├── security/                      # Security & compliance standards
│   ├── privacy/                       # Privacy policy
│   ├── terms/                         # Terms of service
│   ├── contact/                       # Enterprise contact page
│   └── api/                           # Secure RESTful Next.js API endpoints
│       ├── invite-agent/              # Agora Conversational AI dynamic prompt bridge
│       ├── dialer/start-call/         # Phone number validation & agent dispatch
│       ├── company/                   # Company Brain & knowledge management
│       ├── agent/                     # Officer registration, login & status
│       ├── action/                    # Verified voice tool API execution
│       └── telephony/                 # Webhook & outbound calling hooks
├── components/
│   ├── LandingPage.tsx                # Floating glass navbar, hero, pricing & comparison
│   ├── AgoraConversationWrapper.tsx   # Agora WebRTC audio stream bridge
│   ├── ConversationComponent.tsx      # Real-time voice interaction component
│   └── echosphere/                    # Health meter, transcripts & agent indicators
├── lib/
│   ├── mongodb/                       # Native MongoDB connection pool & models
│   ├── db/                            # Unified multi-tenant persistence layer
│   ├── echosphere/                    # Prompt engineering, guardrails & brain compiler
│   └── telephony/                     # DTMF phone conversion & routing
├── public/                            # Static SVG assets & images
└── scripts/
    ├── test-mongodb.ts                # MongoDB persistence test script
    └── verify-api-contracts.ts        # Contract verification runner
```

---

## 🛡️ Guardrails & Safety Boundaries

CAVI enforces strict AI behavior boundaries:
1. **Never Make Unverified Guarantees:** Cannot promise financial compensations exceeding tenant thresholds.
2. **Deterministic Confirmation:** Critical entities (IDs, booking numbers, emails) are read back to the user before executing tool mutations.
3. **Graceful Escalation:** When a caller expresses distress or ambiguity is high, transfer occurs immediately with complete context preserved.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for conversations. Designed for resolution.**

© 2026 CAVI. All rights reserved.

</div>
