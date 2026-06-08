import apiClient from './client';

// 认证
export const authApi = {
  register: (data: { email: string; password: string; nickname: string }) =>
    apiClient.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
};

// 题目
export const questionApi = {
  list: (params: Record<string, any>) => apiClient.get('/questions', { params }),
  get: (id: string) => apiClient.get(`/questions/${id}`),
  create: (data: any) => apiClient.post('/questions', data),
  batchImport: (data: any) => apiClient.post('/questions/batch', data),
  importFile: (data: { fileBase64: string; fileName: string }) =>
    apiClient.post('/questions/import-file', data),
};

// 答题
export const answerApi = {
  submit: (data: { questionId: string; userAnswer: string; type: string; language?: string }) =>
    apiClient.post('/answers', data),
  getWrong: (params?: Record<string, any>) => apiClient.get('/answers/wrong', { params }),
  removeWrong: (questionId: string) => apiClient.delete(`/answers/wrong/${questionId}`),
  clearWrong: () => apiClient.delete('/answers/wrong'),
};

// 考试
export const examApi = {
  create: (data: any) => apiClient.post('/exams', data),
  start: (id: string) => apiClient.post(`/exams/${id}/start`),
  submit: (id: string, data: any) => apiClient.post(`/exams/${id}/submit`, data),
  list: () => apiClient.get('/exams'),
  get: (id: string) => apiClient.get(`/exams/${id}`),
};

// 收藏
export const favoriteApi = {
  list: (params?: Record<string, any>) => apiClient.get('/favorites', { params }),
  add: (questionId: string) => apiClient.post('/favorites', { questionId }),
  remove: (questionId: string) => apiClient.delete(`/favorites/${questionId}`),
};

// 笔记
export const noteApi = {
  get: (questionId: string) => apiClient.get(`/notes/${questionId}`),
  create: (data: { questionId: string; content: string }) => apiClient.post('/notes', data),
  update: (questionId: string, content: string) => apiClient.put(`/notes/${questionId}`, { content }),
};

// 统计
export const statsApi = {
  get: (params?: Record<string, any>) => apiClient.get('/stats', { params }),
};

// 评论
export const commentApi = {
  list: (questionId: string) => apiClient.get(`/comments/${questionId}`),
};

// 用户
export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    apiClient.put('/user/password', data),
};
