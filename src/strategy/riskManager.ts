export function calcPositionSize(balance: number, riskPerTrade: number, entry: number, stopLoss: number): number {
  const risk = balance * riskPerTrade;
  const perUnitRisk = Math.abs(entry - stopLoss);
  if (perUnitRisk <= 0) return 0;
  return risk / perUnitRisk;
}
