import TelegramBot from 'node-telegram-bot-api';
import { env } from '../config/env';
import { prisma } from '../prisma/client';

export const bot = new TelegramBot(env.telegramBotToken, { polling: true });

export async function notify(text: string) {
  const recipients = await prisma.telegramRecipient.findMany({ where: { isActive: true } });
  const targets = recipients.length ? recipients.map((r) => r.chatId) : env.telegramChatId ? [env.telegramChatId] : [];
  await Promise.allSettled(targets.map((chatId) => bot.sendMessage(chatId, text)));
}

export function registerCommands(state: { paused: boolean }) {
  bot.onText(/\/start/, () => notify('Бот запущен (paper trading).'));
  bot.onText(/\/status/, async () => notify(`Статус: ${state.paused ? 'PAUSED' : 'RUNNING'}`));
  bot.onText(/\/balance/, async () => {
    const closed = await prisma.trade.findMany({ where: { status: 'CLOSED' } });
    const pnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
    notify(`Balance: ${(1000 + pnl).toFixed(2)} USDT`);
  });
  bot.onText(/\/trades/, async () => { const c = await prisma.trade.count(); notify(`Всего сделок: ${c}`); });
  bot.onText(/\/open_trades/, async () => { const c = await prisma.trade.count({ where: { status: 'OPEN' } }); notify(`Открытых сделок: ${c}`); });
  bot.onText(/\/report/, async () => {
    const r = await prisma.dailyReport.findFirst({ orderBy: { date: 'desc' } });
    notify(r ? `Report ${r.date.toISOString()}: pnl ${r.pnlDay.toFixed(2)}` : 'Нет отчёта');
  });
  bot.onText(/\/pause/, () => { state.paused = true; notify('Сканер на паузе'); });
  bot.onText(/\/resume/, () => { state.paused = false; notify('Сканер возобновлен'); });
}
