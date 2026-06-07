import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, redis } from '../app';
import { success, fail } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;

    if (!email || !password || !nickname) {
      return next(createError(400, '邮箱、密码和昵称不能为空'));
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return next(createError(409, '该邮箱已被注册'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, nickname },
    });

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '15m' as any },
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      { expiresIn: '7d' as any },
    );

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 3600);

    success(res, {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, createdAt: user.createdAt, updatedAt: user.updatedAt },
    }, '注册成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, '邮箱和密码不能为空'));
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError(401, '邮箱或密码错误'));
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return next(createError(401, '邮箱或密码错误'));
    }

    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '15m' as any },
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
      { expiresIn: '7d' as any },
    );

    await redis.set(`refresh:${user.id}`, refreshToken, 'EX', 7 * 24 * 3600);

    success(res, {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar, createdAt: user.createdAt, updatedAt: user.updatedAt },
    }, '登录成功');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(createError(400, 'Refresh token 不能为空'));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as { userId: string };

    const stored = await redis.get(`refresh:${decoded.userId}`);
    if (stored !== refreshToken) {
      return next(createError(401, 'Refresh token 无效'));
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '15m' as any },
    );

    success(res, { accessToken }, 'Token 刷新成功');
  } catch {
    next(createError(401, 'Refresh token 无效或已过期'));
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await redis.del(`refresh:${req.userId}`);
    success(res, null, '退出登录成功');
  } catch (err) {
    next(err);
  }
});

export default router;
