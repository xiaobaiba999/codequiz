import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { getRedis } from './config/redis';
import { setupSwagger } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import questionRoutes from './routes/question';
import answerRoutes from './routes/answer';
import examRoutes from './routes/exam';
import favoriteRoutes from './routes/favorite';
import noteRoutes from './routes/note';
import statsRoutes from './routes/stats';
import commentRoutes from './routes/comment';
import userRoutes from './routes/user';

let _prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
    });
  }
  return _prisma;
}

// 兼容旧代码的导出
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrisma() as any)[prop];
  },
});

export const redis = new Proxy({} as ReturnType<typeof getRedis>, {
  get(_, prop) {
    return (getRedis() as any)[prop];
  },
});

export function createApp() {
  const app = express();

  // CORS 配置
  app.use(cors({
    origin: true,
    credentials: true,
  }));
  app.use(express.json());

  // Swagger 文档
  setupSwagger(app);

  // 路由
  app.use('/api/auth', authRoutes);
  app.use('/api/questions', questionRoutes);
  app.use('/api/answers', answerRoutes);
  app.use('/api/exams', examRoutes);
  app.use('/api/favorites', favoriteRoutes);
  app.use('/api/notes', noteRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/comments', commentRoutes);
  app.use('/api/user', userRoutes);

  // 健康检查
  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok' }, message: 'Server is running' });
  });

  // 错误处理
  app.use(errorHandler);

  return app;
}
