import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';

const app = express();
app.get('/api/test', (_req, res) => {
  res.json({ ok: true, msg: 'express works' });
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res);
}
