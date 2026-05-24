import { prisma } from '../prisma/client';

export async function buildDailyReport(initialBalance: number) {
  const since = new Date(); since.setUTCHours(0,0,0,0);
  const trades = await prisma.trade.findMany({ where: { status: 'CLOSED', closedAt: { gte: since } } });
  const pnlDay = trades.reduce((s,t)=>s+(t.pnl??0),0);
  const wins = trades.filter(t => (t.pnl ?? 0) > 0);
  const losses = trades.filter(t => (t.pnl ?? 0) < 0);
  const topMistakes = [...new Set(losses.flatMap(t => t.mistakeTags))].slice(0, 5);
  const recommendation = pnlDay >= 0 ? 'продолжать' : losses.length > wins.length ? 'снизить риск' : 'остановить торговлю';
  return prisma.dailyReport.upsert({
    where: { date: since },
    update: {},
    create: {
      date: since, balance: initialBalance + pnlDay, pnlDay, tradeCount: trades.length,
      winRate: trades.length ? wins.length / trades.length : 0,
      avgProfit: wins.length ? wins.reduce((s,t)=>s+(t.pnl??0),0)/wins.length : 0,
      avgLoss: losses.length ? losses.reduce((s,t)=>s+(t.pnl??0),0)/losses.length : 0,
      topMistakes, bestSymbols: [], recommendation
    }
  });
}
