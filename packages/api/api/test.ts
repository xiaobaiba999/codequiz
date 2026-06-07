import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/app';

const app = createApp();

export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.url === '/api/test') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true, msg: 'full app loaded' }));
    return;
  }
  app(req, res);
}
