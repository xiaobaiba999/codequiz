import { Router } from 'express';
import { prisma } from '../app';
import { success, fail } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/questions
 * 题目列表（分页、搜索、筛选）
 */
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const keyword = req.query.keyword as string;
    const type = req.query.type as string;
    const difficulty = req.query.difficulty as string;
    const tags = req.query.tags ? (req.query.tags as string).split(',') : undefined;

    const where: any = {};
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (tags && tags.length > 0) where.tags = { hasEvery: tags };

    const [items, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    // 查询用户答题状态
    const userAnswers = await prisma.userAnswer.findMany({
      where: { userId: req.userId, questionId: { in: items.map(q => q.id) } },
      select: { questionId: true, isCorrect: true },
    });

    const answerMap = new Map(userAnswers.map(a => [a.questionId, a.isCorrect]));

    const itemsWithStatus = items.map(q => ({
      ...q,
      completed: answerMap.has(q.id),
      isCorrect: answerMap.get(q.id) ?? null,
    }));

    success(res, { items: itemsWithStatus, total, page, pageSize }, '获取题目列表成功');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/questions/:id
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!question) {
      return next(createError(404, '题目不存在'));
    }

    // 查询用户是否收藏
    const favorite = await prisma.favorite.findUnique({
      where: { userId_questionId: { userId: req.userId!, questionId: question.id } },
    });

    // 查询用户笔记
    const note = await prisma.note.findUnique({
      where: { userId_questionId: { userId: req.userId!, questionId: question.id } },
    });

    success(res, { ...question, isFavorited: !!favorite, note: note?.content || null }, '获取题目详情成功');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/questions
 * 创建题目
 */
router.post('/', async (req, res, next) => {
  try {
    const { type, title, content, options, answer, analysis, difficulty, tags, testCases, language, starterCode } = req.body;

    const question = await prisma.question.create({
      data: { type, title, content, options, answer, analysis, difficulty, tags, testCases, language, starterCode },
    });

    success(res, question, '创建题目成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/questions/:id
 */
router.put('/:id', async (req, res, next) => {
  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: req.body,
    });
    success(res, question, '更新题目成功');
  } catch (err) {
    next(createError(404, '题目不存在'));
  }
});

/**
 * DELETE /api/questions/:id
 */
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    success(res, null, '删除题目成功');
  } catch (err) {
    next(createError(404, '题目不存在'));
  }
});

/**
 * POST /api/questions/batch
 * 批量导入题目
 */
router.post('/batch', async (req, res, next) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return next(createError(400, '题目列表不能为空'));
    }

    const result = await prisma.question.createMany({ data: questions });
    success(res, { count: result.count }, `成功导入 ${result.count} 道题目`, 201);
  } catch (err) {
    next(err);
  }
});

export default router;
