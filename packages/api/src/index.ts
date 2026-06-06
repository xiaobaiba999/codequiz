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

// Redis 连接，生产环境使用 Upstash（兼容 ioredis）
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 200, 2000);
    return delay;
  },
});

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 配置：生产环境允许 Vercel 域名
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Vercel 部署后的域名
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

// 启动服务
app.listen(PORT, () => {
  console.log(`[CodeQuiz API] Server running on http://localhost:${PORT}`);
  console.log(`[CodeQuiz API] Swagger docs at http://localhost:${PORT}/api-docs`);
});

// 优雅关闭
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
