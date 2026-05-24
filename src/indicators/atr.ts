import { Candle } from '../exchange/okxClient';
export function atr(candles: Candle[], period = 14): number[] {
  if (candles.length <= period) return [];
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i], p = candles[i - 1];
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - p.close), Math.abs(c.low - p.close)));
  }
  let avg = trs.slice(0, period).reduce((a, b) => a + b, 0) / period;
  const out = [avg];
  for (let i = period; i < trs.length; i++) { avg = (avg * (period - 1) + trs[i]) / period; out.push(avg); }
  return out;
}
