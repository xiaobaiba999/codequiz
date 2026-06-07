import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

const app = createApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
