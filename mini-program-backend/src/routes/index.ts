import Router from 'koa-router'
import authRouter from './auth'
import userRouter from './user'
import goodsRouter from './goods'
import uploadRouter from './upload'

const router = new Router()

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
router.use(userRouter.routes(), userRouter.allowedMethods())
router.use(goodsRouter.routes(), goodsRouter.allowedMethods())
router.use(uploadRouter.routes(), uploadRouter.allowedMethods())

export default router
