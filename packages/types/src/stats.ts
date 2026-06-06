export interface DailyStats {
  date: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  timeSpent: number;
}

export interface CategoryStats {
  tag: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  overallAccuracy: number;
  totalTimeSpent: number;
  streakDays: number;
  dailyStats: DailyStats[];
  categoryStats: CategoryStats[];
}

export interface StatsQuery {
  period?: 'day' | 'week' | 'month';
}
