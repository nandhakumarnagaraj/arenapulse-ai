# ArenaPulse AI — Smart Stadium Operations Copilot

> GenAI-powered operational intelligence for FIFA World Cup 2026 stadium management.

## Overview

ArenaPulse AI is a real-time stadium operations dashboard that uses Google Gemini AI to analyze incidents, generate crowd rerouting decisions, deploy volunteers, and produce multilingual public announcements — all in seconds.

## Features

- **Live Stadium Dashboard** — Visual SVG map with real-time zone status (Green/Yellow/Red)
- **Mock Telemetry Engine** — Simulates realistic stadium events (gate failures, crowd surges, transit delays, weather alerts, medical emergencies)
- **Gemini AI Analysis** — Sends incidents to Google Gemini for structured incident analysis
- **Dynamic Rerouting** — AI-generated crowd diversion instructions
- **Volunteer Deployment** — Automated briefing messages and deployment counts
- **Multilingual Announcements** — Professional stadium announcements in English, Spanish, and French
- **Server-Sent Events** — Real-time telemetry streaming to the dashboard
- **Fallback Mode** — Works without API key using rule-based responses

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Google Gemini 2.0 Flash
- **Real-time:** Server-Sent Events (SSE)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Google Gemini API key (optional — fallback mode works without it)

### Setup

```bash
# Clone the repository
git clone https://github.com/nandhakumarnagaraj/arenapulse-ai.git
cd arenapulse-ai

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Gemini API key (optional)
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai/route.ts          # Gemini AI incident analysis
│   │   ├── announce/route.ts    # Multilingual announcement generator
│   │   └── events/route.ts      # SSE telemetry stream
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main page
│   └── globals.css              # Theme styles
├── components/
│   ├── Dashboard.tsx            # Main orchestrator
│   ├── Header.tsx               # Match info + countdown
│   ├── StadiumMap.tsx           # SVG stadium layout
│   ├── ZoneCard.tsx             # Zone status cards
│   ├── AlertPanel.tsx           # Live incident feed
│   ├── AIConsole.tsx            # AI decision display
│   └── AnnouncementBar.tsx      # Multilingual announcements
├── lib/
│   ├── types.ts                 # TypeScript interfaces
│   ├── telemetry.ts             # Event generator
│   ├── gemini.ts                # Gemini API wrapper
│   └── prompts.ts               # System prompts
└── data/
    └── stadium.ts               # Zone definitions
```

## How It Works

1. **Telemetry Engine** generates random stadium events every 5-10 seconds
2. **SSE Stream** pushes events to the dashboard in real-time
3. Non-routine events (CRITICAL/WARNING) are sent to **Gemini AI** for analysis
4. AI returns structured JSON with:
   - Incident severity classification
   - Root cause analysis
   - Dynamic rerouting instructions
   - Volunteer deployment plan
   - Multilingual public announcements (EN/ES/FR)
5. Dashboard updates zone colors and displays AI decisions instantly

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | No | Google Gemini API key. Without it, fallback mode provides rule-based responses. |

## License

Built for PromptWars Virtual — Challenge 4: Smart Stadiums & Tournament Operations.
