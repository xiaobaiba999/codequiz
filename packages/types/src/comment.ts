export interface Comment {
  id: string;
  questionId: string;
  userId: string;
  nickname: string;
  avatar: string | null;
  content: string;
  createdAt: string;
}

export interface CommentListResponse {
  items: Comment[];
  total: number;
}
