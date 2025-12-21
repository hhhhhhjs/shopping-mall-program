import Router from 'koa-router'

const router = new Router({
  prefix: '/auth',
})

/**
 * 手机号一键登录
 * POST /api/auth/phoneLogin
 */
router.post('/phoneLogin', async (ctx) => {
  const { code, phoneCode } = ctx.request.body as {
    code: string
    phoneCode: string
  }

  console.log('手机号登录请求:', { code, phoneCode })

  // TODO: 实现微信手机号登录逻辑
  // 1. 使用 code 调用微信 code2Session 获取 session_key 和 openid
  // 2. 使用 phoneCode 调用微信 getPhoneNumber 获取手机号
  // 3. 根据手机号创建或查找用户
  // 4. 生成 token 返回

  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      token: 'mock_token_' + Date.now(),
      expiresIn: 7200,
    },
  }
})

/**
 * 微信登录
 * POST /api/auth/wxLogin
 */
router.post('/wxLogin', async (ctx) => {
  const { code } = ctx.request.body as { code: string }

  console.log('微信登录请求:', { code })

  // TODO: 实现微信登录逻辑

  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      token: 'mock_token_' + Date.now(),
      expiresIn: 7200,
    },
  }
})

/**
 * 账号密码登录
 * POST /api/auth/login
 */
router.post('/login', async (ctx) => {
  const { username, password } = ctx.request.body as {
    username: string
    password: string
  }

  console.log('账号密码登录请求:', { username })

  // TODO: 实现账号密码登录逻辑

  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      token: 'mock_token_' + Date.now(),
      expiresIn: 7200,
    },
  }
})

/**
 * 退出登录
 * GET /api/auth/logout
 */
router.get('/logout', async (ctx) => {
  // TODO: 实现退出登录逻辑

  ctx.body = {
    code: 0,
    message: 'ok',
  }
})

export default router
