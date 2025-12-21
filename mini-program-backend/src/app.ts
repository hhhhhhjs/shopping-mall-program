import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes'

const app = new Koa()

// 中间件
app.use(bodyParser())

// 错误处理
app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err: any) {
    ctx.status = err.status || 500
    ctx.body = {
      code: ctx.status,
      message: err.message || '服务器内部错误',
    }
    console.error('Error:', err)
  }
})

// 路由
app.use(router.routes())
app.use(router.allowedMethods())

// 启动服务
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

export default app
