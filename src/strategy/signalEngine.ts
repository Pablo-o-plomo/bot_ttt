import { Candle } from '../exchange/okxClient';
import { ema } from '../indicators/ema';
import { rsi } from '../indicators/rsi';
import { sma } from '../indicators/volume';
import { atr } from '../indicators/atr';

export type SignalResult = { action: 'BUY'|'HOLD'; reason: string; blockedBy?: string; metrics: { ema50:number; ema200:number; rsi:number; atr:number; volume:number; volumeSma20:number; price:number } };

export function buildSignal(candles: Candle[]): SignalResult {
  const closes = candles.map(c => c.close), vols = candles.map(c=>c.volume);
  const ema50 = ema(closes, 50).at(-1) ?? 0;
  const ema200 = ema(closes, 200).at(-1) ?? 0;
  const rsi14 = rsi(closes, 14).at(-1) ?? 50;
  const volSma20 = sma(vols, 20).at(-1) ?? 0;
  const atr14 = atr(candles, 14).at(-1) ?? 0;
  const price = closes.at(-1) ?? 0;
  const volume = vols.at(-1) ?? 0;
  const metrics = { ema50, ema200, rsi: rsi14, atr: atr14, volume, volumeSma20: volSma20, price };
  if (Math.abs(ema50 - ema200) / Math.max(price, 1) < 0.001) return { action: 'HOLD', reason: 'EMA too close', blockedBy: 'ema_distance', metrics };
  if (atr14 / Math.max(price, 1) < 0.002) return { action: 'HOLD', reason: 'ATR too low', blockedBy: 'low_atr', metrics };
  const ok = ema50 > ema200 && rsi14 >=45 && rsi14 <=65 && volume > volSma20 && price > ema50;
  return ok ? { action: 'BUY', reason: 'Trend+momentum+volume aligned', metrics } : { action: 'HOLD', reason: 'Conditions not met', metrics };
}
