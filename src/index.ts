import { env, getEnvValidationErrors } from './config/env';
import { logger } from './config/logger';
import { runScanner } from './jobs/marketScanner';
import { buildDailyReport } from './reports/dailyReport';
import { registerCommands, notify, bot } from './telegram/bot';
import { startWebPanel } from './web/panel';

const errors = getEnvValidationErrors();
const fatal = errors.filter((e) => e.startsWith('Live trading is blocked'));
if (fatal.length) {
  logger.error({ errors: fatal }, 'Configuration error. Service cannot start.');
  process.exit(1);
}

for (const warning of errors.filter((e) => !fatal.includes(e))) {
  logger.warn(warning);
}

const hasDatabase = Boolean(env.databaseUrl);
const state = { paused: false };

startWebPanel(env.panelPort);

if (hasDatabase) {
  registerCommands(state);

  async function tick() {
    try {
      await runScanner(state);
    } catch (e) {
      logger.error(e);
    }
  }

  setInterval(tick, env.scanIntervalMs);
  setInterval(async () => {
    const r = await buildDailyReport(env.initialBalance);
    await notify(`📊 Daily: balance ${r.balance.toFixed(2)}, pnl ${r.pnlDay.toFixed(2)}, trades ${r.tradeCount}, winrate ${(r.winRate * 100).toFixed(1)}%, rec: ${r.recommendation}`);
  }, 24 * 60 * 60 * 1000);

  tick();
}

logger.info({ telegramEnabled: !!bot, hasDatabase }, 'Bot started');
