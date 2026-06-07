import { Router } from 'express';
import { prisma } from '../app';
import { success } from '../utils/response';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/stats
 * 获取学习统计
 */
router.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.userId!;
    const period = (req.query.period as string) || 'week';

    // 总体统计
    const totalAnswered = await prisma.userAnswer.count({ where: { userId } });
    const totalCorrect = await prisma.userAnswer.count({ where: { userId, isCorrect: true } });
    const overallAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 10000) / 100 : 0;

    // 总学习时长（秒）
    const timeResult = await prisma.userAnswer.aggregate({
      where: { userId },
      _sum: { timeSpent: true },
    });
    const totalTimeSpent = timeResult._sum.timeSpent || 0;

    // 连续刷题天数
    const streakDays = await calculateStreakDays(userId);

    // 每日统计
    const days = period === 'month' ? 30 : period === 'week' ? 7 : 1;
    const dailyStats = await getDailyStats(userId, days);

    // 分类掌握度
    const categoryStats = await getCategoryStats(userId);

    success(res, {
      totalAnswered,
      totalCorrect,
      overallAccuracy,
      totalTimeSpent,
      streakDays,
      dailyStats,
      categoryStats,
    }, '获取统计成功');
  } catch (err) {
    next(err);
  }
});

async function calculateStreakDays(userId: string): Promise<number> {
  const answers = await prisma.userAnswer.findMany({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: 'desc' },
    distinct: ['createdAt'],
  });

  if (answers.length === 0) return 0;

  const dates = [...new Set(answers.map(a => a.createdAt.toISOString().split('T')[0]))];
  let streak = 1;
  const today = new Date().toISOString().split('T')[0];

  if (dates[0] !== today) return 0;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);

    if (Math.floor(diff) === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

async function getDailyStats(userId: string, days: number) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const answers = await prisma.userAnswer.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: { isCorrect: true, timeSpent: true, createdAt: true },
  });

  const dailyMap = new Map<string, { total: number; correct: number; timeSpent: number }>();

  for (const answer of answers) {
    const date = answer.createdAt.toISOString().split('T')[0];
    const existing = dailyMap.get(date) || { total: 0, correct: 0, timeSpent: 0 };
    existing.total++;
    if (answer.isCorrect) existing.correct++;
    existing.timeSpent += answer.timeSpent;
    dailyMap.set(date, existing);
  }

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = dailyMap.get(dateStr) || { total: 0, correct: 0, timeSpent: 0 };

    result.push({
      date: dateStr,
      totalQuestions: stats.total,
      correctCount: stats.correct,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 10000) / 100 : 0,
      timeSpent: stats.timeSpent,
    });
  }

  return result;
}

async function getCategoryStats(userId: string) {
  const answers = await prisma.userAnswer.findMany({
    where: { userId },
    include: { question: { select: { tags: true } } },
  });

  const categoryMap = new Map<string, { total: number; correct: number }>();

  for (const answer of answers) {
    for (const tag of answer.question.tags) {
      const existing = categoryMap.get(tag) || { total: 0, correct: 0 };
      existing.total++;
      if (answer.isCorrect) existing.correct++;
      categoryMap.set(tag, existing);
    }
  }

  return Array.from(categoryMap.entries()).map(([tag, stats]) => ({
    tag,
    totalQuestions: stats.total,
    correctCount: stats.correct,
    accuracy: Math.round((stats.correct / stats.total) * 10000) / 100,
  }));
}

export default router;
