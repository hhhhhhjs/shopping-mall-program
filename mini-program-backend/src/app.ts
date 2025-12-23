import 'dotenv/config'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import path from 'path'
import router from './routes'
import { testConnection } from './db'
import { staticConfig } from './config'
import fs from 'fs'

const app = new Koa()

// 确保静态文件目录存在
const avatarDir = path.join(staticConfig.root, staticConfig.upload.avatarDir)
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true })
  console.log(`📁 创建头像目录: ${avatarDir}`)
}

// 中间件
app.use(bodyParser())

// 静态文件服务 - 挂载到 /static 路径
const staticMiddleware = serve(staticConfig.root)
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/static')) {
    // 去掉 /static 前缀后交给 koa-static 处理
    const originalPath = ctx.path
    ctx.path = ctx.path.replace('/static', '') || '/'
    await staticMiddleware(ctx, async () => {
      // 如果静态文件未找到，恢复原始路径继续
      ctx.path = originalPath
      await next()
    })
  } else {
    await next()
  }
})

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

// 启动时测试数据库连接
testConnection().then((connected) => {
  if (!connected) {
    console.warn('⚠️ Database connection failed, but server will continue to run')
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
})

export default app
