import { Router } from 'express';
import { prisma } from '../app';
import { success } from '../utils/response';
import { createError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/comments/:questionId
 * 获取题目评论列表
 */
router.get('/:questionId', async (req, res, next) => {
  try {
    const { questionId } = req.params;

    const comments = await prisma.comment.findMany({
      where: { questionId },
      orderBy: { createdAt: 'desc' },
    });

    success(res, { items: comments, total: comments.length }, '获取评论成功');
  } catch (err) {
    next(err);
  }
});

export default router;
