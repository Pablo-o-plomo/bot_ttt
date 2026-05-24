import express from 'express';
import { prisma } from '../prisma/client';
import { logger } from '../config/logger';

export function startWebPanel(port = 3000) {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  app.get('/', async (_req, res) => {
    const recipients = await prisma.telegramRecipient.findMany({ orderBy: { createdAt: 'desc' } });
    const openTrades = await prisma.trade.count({ where: { status: 'OPEN' } });
    const closedTrades = await prisma.trade.findMany({ where: { status: 'CLOSED' } });
    const pnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);

    const rows = recipients
      .map(
        (r) => `<tr><td>${r.name}</td><td>${r.chatId}</td><td>${r.isChannel ? 'channel' : 'user'}</td><td>${r.isActive ? 'active' : 'paused'}</td>
<td>
<form method="post" action="/recipients/${r.id}/toggle" style="display:inline"><button>${r.isActive ? 'Disable' : 'Enable'}</button></form>
<form method="post" action="/recipients/${r.id}/delete" style="display:inline"><button>Delete</button></form>
</td></tr>`
      )
      .join('');

    res.send(`<!doctype html><html><head><meta charset="utf-8"/><title>Trading Bot Panel</title></head><body>
<h1>Crypto Bot Panel</h1>
<p>Open trades: ${openTrades} | Total PnL: ${pnl.toFixed(2)}</p>
<h2>Add Telegram recipient</h2>
<form method="post" action="/recipients">
<input name="name" placeholder="Name" required />
<input name="chatId" placeholder="Chat ID or @channel" required />
<label><input type="checkbox" name="isChannel"/> Channel</label>
<button type="submit">Save</button>
</form>
<h2>Recipients</h2>
<table border="1" cellpadding="6"><tr><th>Name</th><th>Chat</th><th>Type</th><th>Status</th><th>Actions</th></tr>${rows}</table>
</body></html>`);
  });

  app.post('/recipients', async (req, res) => {
    const { name, chatId, isChannel } = req.body as { name?: string; chatId?: string; isChannel?: string };
    if (!name || !chatId) return res.status(400).send('name and chatId are required');
    await prisma.telegramRecipient.upsert({
      where: { chatId },
      update: { name, isChannel: isChannel === 'on', isActive: true },
      create: { name, chatId, isChannel: isChannel === 'on' }
    });
    res.redirect('/');
  });

  app.post('/recipients/:id/toggle', async (req, res) => {
    const existing = await prisma.telegramRecipient.findUnique({ where: { id: req.params.id } });
    if (existing) {
      await prisma.telegramRecipient.update({ where: { id: req.params.id }, data: { isActive: !existing.isActive } });
    }
    res.redirect('/');
  });

  app.post('/recipients/:id/delete', async (req, res) => {
    await prisma.telegramRecipient.delete({ where: { id: req.params.id } });
    res.redirect('/');
  });

  app.listen(port, () => logger.info({ port }, 'Web panel started'));
}
