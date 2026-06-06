import { Router } from 'express';
import { prisma } from '../index';
import { success } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/notes/:questionId
 * 获取笔记
 */
router.get('/:questionId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const note = await prisma.note.findUnique({
      where: { userId_questionId: { userId: req.userId!, questionId: req.params.questionId } },
    });

    success(res, note, note ? '获取笔记成功' : '暂无笔记');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notes
 * 创建笔记
 */
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { questionId, content } = req.body;
    const userId = req.userId!;

    if (!content || !content.trim()) {
      return next(createError(400, '笔记内容不能为空'));
    }

    const existing = await prisma.note.findUnique({
      where: { userId_questionId: { userId, questionId } },
    });

    if (existing) {
      const updated = await prisma.note.update({
        where: { id: existing.id },
        data: { content },
      });
      return success(res, updated, '笔记已更新');
    }

    const note = await prisma.note.create({
      data: { userId, questionId, content },
    });

    success(res, note, '笔记创建成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/notes/:questionId
 * 更新笔记
 */
router.put('/:questionId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { content } = req.body;
    const userId = req.userId!;

    const existing = await prisma.note.findUnique({
      where: { userId_questionId: { userId, questionId: req.params.questionId } },
    });

    if (!existing) {
      return next(createError(404, '笔记不存在'));
    }

    const note = await prisma.note.update({
      where: { id: existing.id },
      data: { content },
    });

    success(res, note, '笔记更新成功');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/notes/:questionId
 * 删除笔记
 */
router.delete('/:questionId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    await prisma.note.deleteMany({
      where: { userId: req.userId!, questionId: req.params.questionId },
    });

    success(res, null, '笔记删除成功');
  } catch (err) {
    next(err);
  }
});

export default router;
