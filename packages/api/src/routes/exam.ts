import { Router } from 'express';
import { prisma } from '../index';
import { success } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * POST /api/exams
 * 创建模拟考试
 */
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { title, questionCount, timeLimit, type, difficulty, tags } = req.body;
    const userId = req.userId!;

    // 构建筛选条件
    const where: any = {};
    if (type) where.type = type;
    if (difficulty) where.difficulty = difficulty;
    if (tags && tags.length > 0) where.tags = { hasEvery: tags };

    // 随机抽取题目
    const allQuestions = await prisma.question.findMany({ where, select: { id: true } });
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selectedIds = shuffled.slice(0, questionCount).map(q => q.id);

    if (selectedIds.length < questionCount) {
      return next(createError(400, `题目数量不足，仅找到 ${selectedIds.length} 道符合条件的题目`));
    }

    // 创建考试
    const exam = await prisma.exam.create({
      data: {
        userId,
        title: title || '模拟考试',
        questionCount,
        timeLimit,
        status: 'NOT_STARTED',
        questions: {
          create: selectedIds.map((questionId, index) => ({
            questionId,
            order: index + 1,
          })),
        },
      },
      include: { questions: { include: { question: true } } },
    });

    success(res, exam, '创建考试成功', 201);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/exams/:id/start
 * 开始考试
 */
router.post('/:id/start', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const exam = await prisma.exam.findUnique({ where: { id: req.params.id } });
    if (!exam) return next(createError(404, '考试不存在'));
    if (exam.userId !== req.userId) return next(createError(403, '无权操作'));
    if (exam.status !== 'NOT_STARTED') return next(createError(400, '考试已开始或已结束'));

    const updated = await prisma.exam.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS', startedAt: new Date() },
      include: { questions: { include: { question: true }, orderBy: { order: 'asc' } } },
    });

    success(res, updated, '考试已开始');
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/exams/:id/submit
 * 提交考试
 */
router.post('/:id/submit', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { answers } = req.body;
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: { question: true } } },
    });

    if (!exam) return next(createError(404, '考试不存在'));
    if (exam.userId !== req.userId) return next(createError(403, '无权操作'));
    if (exam.status === 'FINISHED') return next(createError(400, '考试已结束'));

    let correctCount = 0;

    // 批量判题
    for (const answer of answers) {
      const eq = exam.questions.find(q => q.questionId === answer.questionId);
      if (!eq) continue;

      let isCorrect = false;
      const question = eq.question;

      if (question.type === 'MULTI_CHOICE') {
        const sortedUser = answer.userAnswer.split('').sort().join('');
        const sortedAnswer = question.answer.split('').sort().join('');
        isCorrect = sortedUser === sortedAnswer;
      } else if (question.type === 'FILL_BLANK') {
        const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').trim();
        isCorrect = normalize(answer.userAnswer) === normalize(question.answer);
      } else {
        isCorrect = answer.userAnswer === question.answer;
      }

      if (isCorrect) correctCount++;

      // 更新考试题目答案
      await prisma.examQuestion.update({
        where: { examId_questionId: { examId: exam.id, questionId: answer.questionId } },
        data: { userAnswer: answer.userAnswer, isCorrect },
      });

      // 记录用户答题
      await prisma.userAnswer.create({
        data: {
          userId: req.userId!,
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          isCorrect,
          timeSpent: 0,
        },
      });
    }

    // 更新考试状态
    const updated = await prisma.exam.update({
      where: { id: exam.id },
      data: { status: 'FINISHED', finishedAt: new Date() },
    });

    const result = {
      exam: updated,
      totalQuestions: exam.questionCount,
      correctCount,
      accuracy: Math.round((correctCount / exam.questionCount) * 10000) / 100,
      timeSpent: updated.startedAt && updated.finishedAt
        ? Math.round((updated.finishedAt.getTime() - updated.startedAt.getTime()) / 1000)
        : 0,
      details: await prisma.examQuestion.findMany({
        where: { examId: exam.id },
        orderBy: { order: 'asc' },
      }),
    };

    success(res, result, '考试已提交');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/exams
 * 获取考试列表
 */
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const exams = await prisma.exam.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });
    success(res, exams, '获取考试列表成功');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/exams/:id
 * 获取考试详情
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: { questions: { include: { question: true }, orderBy: { order: 'asc' } } },
    });
    if (!exam) return next(createError(404, '考试不存在'));
    success(res, exam, '获取考试详情成功');
  } catch (err) {
    next(err);
  }
});

export default router;
