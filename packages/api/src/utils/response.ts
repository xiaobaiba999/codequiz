import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export function success<T>(res: Response, data: T, message = '操作成功', statusCode = 200) {
  const response: ApiResponse<T> = { success: true, data, message };
  return res.status(statusCode).json(response);
}

export function fail(res: Response, message = '操作失败', statusCode = 400) {
  const response: ApiResponse<null> = { success: false, data: null, message };
  return res.status(statusCode).json(response);
}
