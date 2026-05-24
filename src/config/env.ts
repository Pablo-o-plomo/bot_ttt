import dotenv from 'dotenv';

dotenv.config();

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_PRIVATE_URL;
}

const resolvedDatabaseUrl = getDatabaseUrl();
const required: Array<[string, string | undefined, string]> = [
  ['DATABASE_URL', resolvedDatabaseUrl, 'Set DATABASE_URL (or POSTGRES_URL/DATABASE_PRIVATE_URL) to your PostgreSQL connection string.'],
  ['TELEGRAM_BOT_TOKEN', process.env.TELEGRAM_BOT_TOKEN, 'Set TELEGRAM_BOT_TOKEN from @BotFather.']
];

const missing = required.filter(([, value]) => !value);
if (missing.length) {
  const details = missing.map(([key, , hint]) => `- ${key}: ${hint}`).join('\n');
  throw new Error(`Missing required environment variables:\n${details}\n\nCopy .env.example to .env and fill all required values.`);
}

export const env = {
  databaseUrl: resolvedDatabaseUrl!,
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
