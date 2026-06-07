import type { IncomingMessage, ServerResponse } from 'http';
import { createApp } from '../src/app';

const app = createApp();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    await new Promise<void>((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error: any) {
    console.error('Handler error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: false,
        data: null,
        message: error.message || 'Internal Server Error',
      }));
    }
  }
}
