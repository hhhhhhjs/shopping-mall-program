import Router from 'koa-router'
import { wxService } from '../services/wx'
import { userService } from '../services/user'
import { generateToken } from '../utils/jwt'
import { UserStatus } from '../types/user'

const router = new Router({
  prefix: '/auth',
})

/**
 * 手机号一键登录
 * POST /auth/phoneLogin
 * B2B 项目：通过手机号唯一标识用户
 */
router.post('/phoneLogin', async (ctx) => {
  const { code, phoneCode } = ctx.request.body as {
    code: string
    phoneCode: string
  }

  console.log('手机号登录请求:', { code, phoneCode })

  try {
    // 1. 使用 code 调用微信 code2Session 获取 session_key 和 openid
    const sessionResult = await wxService.code2Session(code)
    console.log('code2Session 结果:', sessionResult)

    if (sessionResult.errcode) {
      ctx.body = {
        code: sessionResult.errcode,
        message: sessionResult.errmsg || '获取 session 失败',
        data: null,
      }
      return
    }

    const { openid } = sessionResult

    if (!openid) {
      ctx.body = {
        code: -1,
        message: '获取用户标识失败',
        data: null,
      }
      return
    }

    // 2. 使用 phoneCode 调用微信 getPhoneNumber 获取手机号
    const phoneResult = await wxService.getPhoneNumber(phoneCode)
    console.log('getPhoneNumber 结果:', phoneResult)

    if (phoneResult.errcode) {
      ctx.body = {
        code: phoneResult.errcode,
        message: phoneResult.errmsg || '获取手机号失败',
        data: null,
      }
      return
    }

    const phoneNumber = phoneResult.phone_info?.phoneNumber

    if (!phoneNumber) {
      ctx.body = {
        code: -1,
        message: '获取手机号失败',
        data: null,
      }
      return
    }

    console.log('用户手机号:', phoneNumber)
    console.log('用户 openid:', openid)

    // 3. 根据手机号查找或创建用户（B2B 核心逻辑：手机号为唯一标识）
    const user = await userService.findOrCreateByPhone(phoneNumber, openid)

    // 4. 检查用户状态
    if (user.status === UserStatus.DISABLED) {
      ctx.body = {
        code: 403,
        message: '账号已被禁用，请联系管理员',
        data: null,
      }
      return
    }

    // 5. 生成 token 返回（token 中包含 userId 和 phone）
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      openid: user.openid,
    })

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        token,
        expiresIn: 7200,
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level,
          points: user.points,
          companyName: user.companyName,
        },
      },
    }
  } catch (error: any) {
    console.error('手机号登录失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '登录失败',
      data: null,
    }
  }
})

/**
 * 退出登录
 * GET /auth/logout
 */
router.get('/logout', async (ctx) => {
  // TODO: 如需服务端管理 token，可在此处理 token 失效逻辑（如加入黑名单）
  ctx.body = {
    code: 0,
    message: 'ok',
  }
})

export default router
