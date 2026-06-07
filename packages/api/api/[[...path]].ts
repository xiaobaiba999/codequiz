import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApp } from '../src/app';

const app = createApp();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 将 VercelRequest 转换为 Express 兼容格式
  await new Promise<void>((resolve, reject) => {
    app(req as any, res as any, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
