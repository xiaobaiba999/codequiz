import { Router } from 'express';
import { prisma } from '../index';
import { success, fail } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { judgeProgrammingQuestion } from '../services/judge';

const router = Router();

/**
 * POST /api/answers
 * 提交答案
 */
router.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { questionId, userAnswer, type, language } = req.body;
    const userId = req.userId!;

    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) {
      return next(createError(404, '题目不存在'));
    }

    let isCorrect = false;
    let executionOutput: string | undefined;
    let executionError: string | undefined;

    switch (type) {
      case 'SINGLE_CHOICE':
      case 'MULTI_CHOICE':
        // 多选题排序后比较
        if (type === 'MULTI_CHOICE') {
          const sortedUser = userAnswer.split('').sort().join('');
          const sortedAnswer = question.answer.split('').sort().join('');
          isCorrect = sortedUser === sortedAnswer;
        } else {
          isCorrect = userAnswer === question.answer;
        }
        break;

      case 'FILL_BLANK':
        // 模糊匹配：忽略大小写和空格
        const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '').trim();
        isCorrect = normalize(userAnswer) === normalize(question.answer);
        break;

      case 'PROGRAMMING': {
        const testCases = question.testCases as Array<{ input: string; expectedOutput: string }> | null;
        if (testCases && testCases.length > 0 && language) {
          const result = await judgeProgrammingQuestion(language, userAnswer, testCases);
          isCorrect = result.passed;
          executionOutput = result.results.map(r => `Input: ${r.input}\nExpected: ${r.expected}\nActual: ${r.actual}\nPassed: ${r.passed}`).join('\n\n');
        } else {
          // 无测试用例或判题服务不可用，返回 mock 结果
          isCorrect = false;
          executionError = '判题服务暂不可用，请稍后再试';
        }
        break;
      }

      default:
        return next(createError(400, '不支持的题目类型'));
    }

    // 记录用户答案
    await prisma.userAnswer.create({
      data: {
        userId,
        questionId,
        userAnswer,
        isCorrect,
        timeSpent: 0,
      },
    });

    success(res, {
      isCorrect,
      correctAnswer: question.answer,
      analysis: question.analysis,
      executionOutput,
      executionError,
    }, '提交答案成功');
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/answers/wrong
 * 获取错题列表
 */
router.get('/wrong', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    // 找出用户答错的题目（取最新一次答题记录）
    const wrongAnswers = await prisma.userAnswer.findMany({
      where: { userId, isCorrect: false },
      orderBy: { createdAt: 'desc' },
      select: { questionId: true },
    });

    // 去重
    const wrongQuestionIds = [...new Set(wrongAnswers.map(a => a.questionId))];

    const [items, total] = await Promise.all([
      prisma.question.findMany({
        where: { id: { in: wrongQuestionIds } },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      Promise.resolve(wrongQuestionIds.length),
    ]);

    success(res, { items, total, page, pageSize }, '获取错题列表成功');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/answers/wrong/:questionId
 * 从错题本移除
 */
router.delete('/wrong/:questionId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const { questionId } = req.params;

    await prisma.userAnswer.deleteMany({
      where: { userId, questionId, isCorrect: false },
    });

    success(res, null, '已从错题本移除');
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/answers/wrong
 * 清空错题本
 */
router.delete('/wrong', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;

    await prisma.userAnswer.deleteMany({
      where: { userId, isCorrect: false },
    });

    success(res, null, '错题本已清空');
  } catch (err) {
    next(err);
  }
});

export default router;
