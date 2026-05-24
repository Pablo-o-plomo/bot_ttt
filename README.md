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
- Expose web service port from `PANEL_PORT`.

## Safety
- `PAPER_TRADING=true` by default.
- Live trading blocked unless both:
  - `PAPER_TRADING=false`
  - `ALLOW_LIVE_TRADING=true`
