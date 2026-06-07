import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
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

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'production' ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
});

export function createApp() {
  const app = express();

  // CORS 配置
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
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
