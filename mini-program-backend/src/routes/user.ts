import Router from 'koa-router'
import { verifyToken } from '../utils/jwt'
import { userService } from '../services/user'
import type { UpdateUserParams } from '../types/user'

const router = new Router({
  prefix: '/user',
})

/**
 * 鉴权中间件：验证 token 并获取用户信息
 */
async function authMiddleware(ctx: any, next: () => Promise<void>) {
  const authHeader = ctx.headers.authorization
  const token = authHeader?.replace('Bearer ', '')

  if (!token) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: '未登录',
      data: null,
    }
    return
  }

  const payload = verifyToken(token)

  if (!payload) {
    ctx.status = 401
    ctx.body = {
      code: 401,
      message: 'token 无效或已过期',
      data: null,
    }
    return
  }

  // 将用户信息挂载到 ctx.state
  ctx.state.user = payload
  await next()
}

/**
 * 获取用户信息
 * GET /user/info
 */
router.get('/info', authMiddleware, async (ctx) => {
  const { userId } = ctx.state.user

  try {
    // 从数据库查询完整用户信息
    const user = await userService.findById(userId)

    if (!user) {
      ctx.status = 404
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null,
      }
      return
    }

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        realName: user.realName,
        companyName: user.companyName,
        level: user.level,
        points: user.points,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    }
  } catch (error: any) {
    console.error('获取用户信息失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取用户信息失败',
      data: null,
    }
  }
})

/**
 * 更新用户信息
 * PUT /user/info
 */
router.put('/info', authMiddleware, async (ctx) => {
  const { userId } = ctx.state.user
  const updateData = ctx.request.body as UpdateUserParams

  try {
    // 只允许更新部分字段
    const allowedFields: UpdateUserParams = {
      nickname: updateData.nickname,
      avatar: updateData.avatar,
      realName: updateData.realName,
      companyName: updateData.companyName,
    }

    const user = await userService.updateUser(userId, allowedFields)

    if (!user) {
      ctx.status = 404
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null,
      }
      return
    }

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatar: user.avatar,
        realName: user.realName,
        companyName: user.companyName,
        level: user.level,
        points: user.points,
      },
    }
  } catch (error: any) {
    console.error('更新用户信息失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '更新用户信息失败',
      data: null,
    }
  }
})

/**
 * 获取用户积分
 * GET /user/points
 */
router.get('/points', authMiddleware, async (ctx) => {
  const { userId } = ctx.state.user

  try {
    const user = await userService.findById(userId)

    if (!user) {
      ctx.status = 404
      ctx.body = {
        code: 404,
        message: '用户不存在',
        data: null,
      }
      return
    }

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        points: user.points,
      },
    }
  } catch (error: any) {
    console.error('获取用户积分失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取用户积分失败',
      data: null,
    }
  }
})

export default router
