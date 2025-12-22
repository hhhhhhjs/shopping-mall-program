import Router from 'koa-router'
import { verifyToken } from '../utils/jwt'

const router = new Router({
  prefix: '/user',
})

/**
 * 获取用户信息
 * GET /user/info
 */
router.get('/info', async (ctx) => {
  // 从 header 中获取 token
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

  // 验证 token
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

  // 返回用户信息
  // TODO: 从数据库查询完整用户信息
  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      userId: 1,
      username: payload.phoneNumber,
      nickname: `用户${payload.phoneNumber.slice(-4)}`,
      avatar: '',
      phoneNumber: payload.phoneNumber,
      openid: payload.openid,
    },
  }
})

export default router
