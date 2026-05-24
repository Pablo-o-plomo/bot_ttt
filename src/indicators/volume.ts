export function sma(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const out: number[] = [];
  let sum = values.slice(0, period).reduce((a,b)=>a+b,0);
  out.push(sum / period);
  for (let i=period;i<values.length;i++){ sum += values[i]-values[i-period]; out.push(sum/period); }
  return out;
}
