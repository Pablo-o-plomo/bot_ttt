import express from 'express';
import { prisma } from '../prisma/client';
import { logger } from '../config/logger';
import { env } from '../config/env';

export function startWebPanel(port = 3000) {
  const app = express();
  app.use(express.urlencoded({ extended: true }));

  const hasDatabase = Boolean(env.databaseUrl);

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, hasDatabase, telegramEnabled: Boolean(env.telegramBotToken) });
  });

  app.get('/', async (_req, res) => {
    if (!hasDatabase) {
      return res.status(200).send(`<!doctype html><html><head><meta charset="utf-8"/><title>Trading Bot Panel</title></head><body>
<h1>Crypto Bot Panel</h1>
<p>Service is running in limited mode.</p>
<ul>
  <li>Database is not configured (DATABASE_URL / POSTGRES_URL / DATABASE_PRIVATE_URL).</li>
  <li>Scanner, reports, and recipient management are disabled.</li>
</ul>
<p>Set database env vars and redeploy to enable full functionality.</p>
</body></html>`);
    }

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
    if (!hasDatabase) return res.status(503).send('Database is not configured');
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
    if (!hasDatabase) return res.status(503).send('Database is not configured');
    const existing = await prisma.telegramRecipient.findUnique({ where: { id: req.params.id } });
    if (existing) {
      await prisma.telegramRecipient.update({ where: { id: req.params.id }, data: { isActive: !existing.isActive } });
    }
    res.redirect('/');
  });

  app.post('/recipients/:id/delete', async (req, res) => {
    if (!hasDatabase) return res.status(503).send('Database is not configured');
    await prisma.telegramRecipient.delete({ where: { id: req.params.id } });
    res.redirect('/');
  });

  app.listen(port, '0.0.0.0', () => logger.info({ port, hasDatabase }, 'Web panel started'));
}
