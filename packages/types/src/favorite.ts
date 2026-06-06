import { Question } from './question';

export interface Favorite {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface FavoriteListResponse {
  items: Question[];
  total: number;
  page: number;
  pageSize: number;
}
