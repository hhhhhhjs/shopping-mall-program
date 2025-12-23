import Router from 'koa-router'
import path from 'path'
import fs from 'fs'
import { verifyToken } from '../utils/jwt'
import { userService } from '../services/user'
import type { UpdateUserParams } from '../types/user'
import { staticConfig } from '../config'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const multer = require('@koa/multer')

const router = new Router({
  prefix: '/user',
})

// 配置 multer 存储 - 临时存储，后续重命名
const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    const uploadPath = path.join(staticConfig.root, staticConfig.upload.avatarDir)
    cb(null, uploadPath)
  },
  filename: (_req: any, file: any, cb: any) => {
    // 临时文件名，上传成功后会重命名为 userId
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    const tempFilename = `temp_${Date.now()}${ext}`
    cb(null, tempFilename)
  },
})

const upload = multer({
  storage,
  limits: {
    fileSize: staticConfig.upload.maxSize,
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (staticConfig.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件类型'))
    }
  },
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
 * 上传头像
 * POST /user/avatar
 */
router.post('/avatar', authMiddleware, upload.single('avatar'), async (ctx: any) => {
  const { userId } = ctx.state.user
  const file = ctx.file

  if (!file) {
    ctx.body = {
      code: -1,
      message: '请选择要上传的图片',
      data: null,
    }
    return
  }

  try {
    const uploadDir = path.join(staticConfig.root, staticConfig.upload.avatarDir)
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg'
    
    // 使用 userId 作为文件名，方便索引和自动覆盖
    const newFilename = `${userId}${ext}`
    const newFilePath = path.join(uploadDir, newFilename)
    const tempFilePath = file.path

    // 删除该用户所有可能存在的旧头像（不同扩展名）
    const possibleExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    for (const oldExt of possibleExts) {
      const oldFilePath = path.join(uploadDir, `${userId}${oldExt}`)
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath)
      }
    }

    // 重命名临时文件为 userId命名
    fs.renameSync(tempFilePath, newFilePath)

    // 拼接完整的头像 URL（添加时间戳防止缓存）
    const avatarUrl = `${staticConfig.baseUrl}/${staticConfig.upload.avatarDir}/${newFilename}?t=${Date.now()}`

    // 更新数据库中的头像 URL
    const user = await userService.updateUser(userId, { avatar: avatarUrl })

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        avatar: avatarUrl,
        user: user ? {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar,
          phone: user.phone,
        } : null,
      },
    }
  } catch (error: any) {
    // 上传失败时删除临时文件
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path)
    }
    console.error('上传头像失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '上传头像失败',
      data: null,
    }
  }
})

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
