export function rsi(values: number[], period = 14): number[] {
  if (values.length <= period) return [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i] - values[i - 1];
    if (d >= 0) gains += d; else losses -= d;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  const out: number[] = [100 - 100 / (1 + avgGain / Math.max(avgLoss, 1e-9))];
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    const gain = Math.max(d, 0), loss = Math.max(-d, 0);
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out.push(100 - 100 / (1 + avgGain / Math.max(avgLoss, 1e-9)));
  }
  return out;
}
