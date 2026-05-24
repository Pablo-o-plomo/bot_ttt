import dotenv from 'dotenv';

dotenv.config();

const required = ['DATABASE_URL', 'TELEGRAM_BOT_TOKEN'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN!,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  panelPort: Number(process.env.PANEL_PORT ?? 3000),
  paperTrading: process.env.PAPER_TRADING !== 'false',
  allowLiveTrading: process.env.ALLOW_LIVE_TRADING === 'true',
  initialBalance: Number(process.env.INITIAL_BALANCE ?? 1000),
  riskPerTrade: Number(process.env.RISK_PER_TRADE ?? 0.01),
  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS ?? 60000)
};

if (!env.paperTrading && !env.allowLiveTrading) {
  throw new Error('Live trading is blocked. Set ALLOW_LIVE_TRADING=true explicitly.');
}
