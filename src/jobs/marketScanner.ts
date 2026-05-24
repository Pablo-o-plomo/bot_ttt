import { OkxClient } from '../exchange/okxClient';
import { prisma } from '../prisma/client';
import { buildSignal } from '../strategy/signalEngine';
import { env } from '../config/env';
import { evaluateExits, hasOpenTrade, openPaperTrade } from '../strategy/tradeManager';
import { notify } from '../telegram/bot';

const pairs = ['BTC-USDT', 'ETH-USDT', 'SOL-USDT', 'XRP-USDT'] as const;
const tfs = ['5m', '15m', '1H'] as const;

export async function runScanner(state: { paused: boolean }) {
  if (state.paused) return;
  const client = new OkxClient();
  for (const symbol of pairs) for (const tf of tfs) {
    const candles = await client.getCandles(symbol, tf, 220);
    const s = buildSignal(candles);
    await prisma.signal.create({ data: { symbol, timeframe: tf, signalType: s.action, reasons: [s.reason], blocked: !!s.blockedBy, blockedBy: s.blockedBy } });
    await prisma.marketSnapshot.create({ data: { symbol, timeframe: tf, price: s.metrics.price, ema50: s.metrics.ema50, ema200: s.metrics.ema200, rsi14: s.metrics.rsi, atr14: s.metrics.atr, volume: s.metrics.volume, volumeSma20: s.metrics.volumeSma20 } });
    const closed = await evaluateExits(symbol, s.metrics.price, s.metrics.rsi, s.metrics.ema50, s.metrics.volume < s.metrics.volumeSma20 * 1.2);
    if (closed) await notify(`🔴 Закрытие ${symbol}: PnL ${closed.pnl?.toFixed(2)}. ${closed.reasonClose}`);
    if (s.action === 'BUY' && !(await hasOpenTrade(symbol))) {
      const trade = await openPaperTrade({ symbol, entry: s.metrics.price, atr: s.metrics.atr, balance: env.initialBalance, riskPerTrade: env.riskPerTrade, reason: s.reason });
      await notify(`🟢 BUY ${symbol} @${trade.entryPrice}. SL ${trade.stopLoss}, TP ${trade.takeProfit}. Причина: ${s.reason}`);
    }
  }
}
