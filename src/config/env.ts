import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
}

export const env = {
  databaseUrl: getDatabaseUrl(),
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  panelPort: Number(process.env.PANEL_PORT ?? 3000),
  paperTrading: process.env.PAPER_TRADING !== 'false',
  allowLiveTrading: process.env.ALLOW_LIVE_TRADING === 'true',
  initialBalance: Number(process.env.INITIAL_BALANCE ?? 1000),
  riskPerTrade: Number(process.env.RISK_PER_TRADE ?? 0.01),
  scanIntervalMs: Number(process.env.SCAN_INTERVAL_MS ?? 60000)
};

export function getEnvValidationErrors(): string[] {
  const errors: string[] = [];

  if (!env.databaseUrl) {
    errors.push('DATABASE_URL is not set. Running in limited mode (no scanner/reports/web panel recipient management). Set DATABASE_URL or POSTGRES_URL/DATABASE_PRIVATE_URL to enable full mode.');
  }

  if (!env.telegramBotToken) {
    errors.push('TELEGRAM_BOT_TOKEN is not set. Telegram notifications and bot commands are disabled.');
  }

  if (!env.paperTrading && !env.allowLiveTrading) {
    errors.push('Live trading is blocked. Set ALLOW_LIVE_TRADING=true explicitly when PAPER_TRADING=false.');
  }

  return errors;
}
