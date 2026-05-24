# crypto-trading-bot (MVP + Web Panel)

Paper-trading crypto bot on Node.js + TypeScript + PostgreSQL + Prisma + Telegram + OKX.

## What is new
- Added web panel to manage Telegram recipients (users/channels).
- You can add multiple chat IDs or channel IDs from browser.
- Bot broadcasts signals/trades/PnL to active recipients.

## Features
- OKX market data (BTC/ETH/SOL/XRP) on 5m, 15m, 1H.
- Indicators: EMA50/EMA200, RSI14, Volume SMA20, ATR14.
- Rule-based BUY/EXIT strategy with entry filters.
- Paper trading only by default.
- Prisma journals: Trade, Signal, MarketSnapshot, DailyReport, TelegramRecipient.
- Telegram alerts + commands.
- Daily performance report.
- Web panel for notification routing.

## Setup
1. Copy `.env.example` -> `.env` and fill values.
   - `DATABASE_URL` is required (the app also accepts `POSTGRES_URL` or `DATABASE_PRIVATE_URL` aliases).
2. Install deps: `npm install`
   - If no database URL is set, service starts in limited mode (scanner/reports/web panel/DB-backed Telegram features disabled).
3. Generate prisma client: `npm run prisma:generate`
4. Run migrations: `npm run prisma:migrate`
5. Start dev bot: `npm run dev`
6. Open panel: `http://localhost:3000` (or `PANEL_PORT`)

## Railway deploy
- Add env vars from `.env.example` in Railway service.
- Build command: `npm run build`
- Start command: `npm run start`
- Ensure PostgreSQL plugin is attached and `DATABASE_URL` is present.
- Railway provides `PORT`; app uses `PORT` first, then `PANEL_PORT`.

## Safety
- `PAPER_TRADING=true` by default.
- Live trading blocked unless both:
  - `PAPER_TRADING=false`
  - `ALLOW_LIVE_TRADING=true`


## Timeweb deploy (Docker)
1. Create `.env` from `.env.example` and set at minimum:
   - `DATABASE_URL` (or `POSTGRES_URL` / `DATABASE_PRIVATE_URL`)
   - `TELEGRAM_BOT_TOKEN` (optional, but required for Telegram commands/alerts)
2. Build and run:
   - `docker compose up -d --build`
3. Check health:
   - `curl http://localhost:3000/healthz`

Notes:
- App listens on `PORT` first, then `PANEL_PORT`, then `3000`.
- If DB URL is missing, app starts in limited mode.


### Timeweb build troubleshooting
- Current Dockerfile does **not** use `apt-get` and must build on `node:22-alpine`.
- If Timeweb is still using an old Dockerfile, trigger a clean rebuild (clear cache / redeploy latest commit).
- In build logs, verify base image line contains `node:22-alpine`.
- Container start command is `npm start` (`node dist/index.js`); PM2 is not required.
