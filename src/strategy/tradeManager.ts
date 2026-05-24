import { Trade } from '@prisma/client';
import { prisma } from '../prisma/client';
import { calcPositionSize } from './riskManager';
import { analyzeTrade } from './tradeAnalyzer';

export async function hasOpenTrade(symbol: string) { return !!await prisma.trade.findFirst({ where: { symbol, status: 'OPEN' } }); }

export async function openPaperTrade(params: { symbol: string; entry: number; atr: number; balance: number; riskPerTrade: number; reason: string; }) {
  const stopLoss = params.entry - params.atr * 1.5;
  const risk = params.entry - stopLoss;
  const takeProfit = params.entry + risk * 2;
  const positionSize = calcPositionSize(params.balance, params.riskPerTrade, params.entry, stopLoss);
  return prisma.trade.create({ data: { symbol: params.symbol, side: 'LONG', entryPrice: params.entry, stopLoss, takeProfit, positionSize, reasonOpen: params.reason, mistakeTags: [] } });
}

export async function evaluateExits(symbol: string, price: number, rsi: number, ema50: number, volumeWeak: boolean): Promise<Trade | null> {
  const t = await prisma.trade.findFirst({ where: { symbol, status: 'OPEN' } });
  if (!t) return null;
  const hit = price <= t.stopLoss || price >= t.takeProfit || rsi > 75 || price < ema50;
  if (!hit) return null;
  const pnl = (price - t.entryPrice) * t.positionSize;
  const pnlPercent = ((price - t.entryPrice) / t.entryPrice) * 100;
  const analysis = analyzeTrade(pnl, price < ema50, volumeWeak);
  return prisma.trade.update({ where: { id: t.id }, data: { status: 'CLOSED', exitPrice: price, closedAt: new Date(), pnl, pnlPercent, reasonClose: analysis.summary, lesson: analysis.lesson, mistakeTags: analysis.tags } });
}
