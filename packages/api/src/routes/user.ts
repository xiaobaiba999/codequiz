import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../index';
import { success } from '../utils/response';
import { createError } from '../middleware/errorHandler';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET /api/user/profile
 * 获取用户信息
 */
router.get('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, nickname: true, avatar: true, createdAt: true, updatedAt: true },
    });

    if (!user) return next(createError(404, '用户不存在'));

    success(res, user, '获取用户信息成功');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/user/profile
 * 更新用户信息
 */
router.put('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { nickname, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { ...(nickname && { nickname }), ...(avatar && { avatar }) },
      select: { id: true, email: true, nickname: true, avatar: true, createdAt: true, updatedAt: true },
    });

    success(res, user, '更新用户信息成功');
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/user/password
 * 修改密码
 */
router.put('/password', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return next(createError(400, '旧密码和新密码不能为空'));
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return next(createError(404, '用户不存在'));

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return next(createError(401, '旧密码错误'));

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword },
    });

    success(res, null, '密码修改成功');
  } catch (err) {
    next(err);
  }
});

export default router;
