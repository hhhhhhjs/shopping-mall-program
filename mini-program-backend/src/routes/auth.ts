import Router from 'koa-router'
import { wxService } from '../services/wx'
import { generateToken } from '../utils/jwt'

const router = new Router({
  prefix: '/auth',
})

/**
 * 手机号一键登录
 * POST /auth/phoneLogin
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

    const { openid, session_key } = sessionResult

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

    // 3. TODO: 根据手机号和 openid 创建或查找用户（需要数据库支持）
    // const user = await userService.findOrCreateByPhone(phoneNumber, openid)

    // 4. 生成 token 返回
    const token = generateToken({ openid, phoneNumber })

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        token,
        expiresIn: 7200,
        phoneNumber,
        openid,
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
  // TODO: 如需服务端管理 token，可在此处理 token 失效逻辑
  ctx.body = {
    code: 0,
    message: 'ok',
  }
})

export default router
