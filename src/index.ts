import { env } from './config/env';
import { logger } from './config/logger';
import { runScanner } from './jobs/marketScanner';
import { buildDailyReport } from './reports/dailyReport';
import { registerCommands, notify } from './telegram/bot';
import { startWebPanel } from './web/panel';

const state = { paused: false };
registerCommands(state);
startWebPanel(env.panelPort);

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
logger.info('Bot started');
