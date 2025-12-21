import Router from 'koa-router'
import authRouter from './auth'

const router = new Router({
  prefix: '/api',
})

// 健康检查
router.get('/health', async (ctx) => {
  ctx.body = {
    code: 0,
    message: 'ok',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  }
})

// 挂载子路由
router.use(authRouter.routes(), authRouter.allowedMethods())

export default router
