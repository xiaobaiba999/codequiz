import type { IncomingMessage, ServerResponse } from 'http';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/test', (_req, res) => {
  res.json({ ok: true, msg: 'express + cors + json works' });
});

export default function handler(req: IncomingMessage, res: ServerResponse) {
  app(req, res);
}
