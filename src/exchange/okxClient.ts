export type Candle = { ts: number; open: number; high: number; low: number; close: number; volume: number };

export class OkxClient {
  private base = 'https://www.okx.com';

  async getCandles(symbol: string, timeframe: '5m'|'15m'|'1H', limit = 250): Promise<Candle[]> {
    const url = `${this.base}/api/v5/market/candles?instId=${symbol}&bar=${timeframe}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OKX error ${res.status}`);
    const json = await res.json() as { data: string[][] };
    return (json.data ?? []).map((x) => ({ ts: Number(x[0]), open: Number(x[1]), high: Number(x[2]), low: Number(x[3]), close: Number(x[4]), volume: Number(x[5]) })).reverse();
  }
}
