# Trophy Wall

Trophy Wall is a full-stack web app that turns your gaming stats into a visual,
shareable profile. Link your Steam account to show off game libraries and
achievement progress, and your HoYoverse accounts (Genshin Impact, Honkai: Star Rail,
Zenless Zone Zero) to showcase your character roster and gear — all in one
polished, browsable page instead of scattered across separate apps.

## Status

🚧 Early development — currently building out core data fetching (Steam + Enka.Network)
and basic display. Not yet deployed.

<!-- Once you have something to show, swap the line above for something like:
✅ Live at [link] — MVP supports Steam library/achievements and HoYoverse character showcase. -->

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS
**Backend:** Node.js, Express, TypeScript
**Database:** PostgreSQL
**Package manager:** pnpm

## Features

- [ ] Link Steam account and display game library with playtime
- [ ] Display Steam achievement completion and rarity
- [ ] Link HoYoverse account(s) and display character showcase (Genshin/HSR/ZZZ)
- [ ] Display equipped artifacts/weapons per character
- [ ] Polished, shareable profile view

<!-- Check items off as you build them, or replace this section with screenshots later -->

## Screenshots

<!-- Add screenshots or a demo GIF here once the UI has something to show -->

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- pnpm (`npm install -g pnpm`)
- PostgreSQL (local install or a hosted instance)
- A [Steam Web API key](https://steamcommunity.com/dev/apikey) (use `localhost` as the domain for local dev)

### Setup

1. Clone the repo
   ```bash
   git clone https://github.com/<your-username>/trophy-wall.git
   cd trophy-wall
   ```

2. Set up the backend
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # fill in your Steam API key and other values in .env
   pnpm dev
   ```

3. Set up the frontend (in a separate terminal)
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

4. Open the app at `http://localhost:5173` (backend runs at `http://localhost:3001`)

## Data Sources

- [Steam Web API](https://developer.valvesoftware.com/wiki/Steam_Web_API) — game library, playtime, achievements
- [Enka.Network](https://github.com/EnkaNetwork/API-docs) — Genshin Impact / Honkai: Star Rail / Zenless Zone Zero character showcase data

## Roadmap / Stretch Goals

- Riot Games API integration (League of Legends match stats)
- Battle.net API integration (Hearthstone collection)
- Playtime/progress history tracking over time
- Multiple linked accounts per platform

## License

<!-- e.g. MIT — add a LICENSE file if you want this to be reusable by others -->

