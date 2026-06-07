import type { VercelRequest, VercelResponse } from '@vercel/node';

let app: any = null;

async function getApp() {
  if (app) return app;
  const { createApp } = await import('../src/app');
  app = createApp();
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp();
    await new Promise<void>((resolve, reject) => {
      expressApp(req as any, res as any, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  } catch (error: any) {
    console.error('Handler error:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: error.message || 'Internal Server Error',
    });
  }
}
