import { Router } from 'express';
import { prisma } from '../index';
import { success } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/favorites
 * 获取收藏列表
 */
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId },
        include: { question: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.favorite.count({ where: { userId } }),
    ]);

    const items = favorites.map(f => f.question);

    success(res, { items, total, page, pageSize }, '获取收藏列表成功');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/favorites
 * 收藏题目
 */
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { questionId } = req.body;
    const userId = req.userId!;

    const existing = await prisma.favorite.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      return next(createError(409, '已收藏该题目'));
    }

    const favorite = await prisma.favorite.create({
      data: { userId, questionId },
    });

    success(res, favorite, '收藏成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/favorites/:questionId
 * 取消收藏
 */
router.delete('/:questionId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { questionId } = req.params;

    await prisma.favorite.deleteMany({
      where: { userId, questionId },
    });

    success(res, null, '取消收藏成功');
  } catch (err) {
    next(err);
  }
});

export default router;
