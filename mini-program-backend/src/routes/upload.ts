/**
 * 图片上传路由
 * 用于处理商品图片的上传
 */
import Router from 'koa-router'
import multer from '@koa/multer'
import { staticConfig } from '../config'
import * as imageService from '../services/image'
import { verifyToken } from '../utils/jwt'

const router = new Router({
  prefix: '/upload',
})

// Multer 配置 - 内存存储
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: staticConfig.upload.goodsImageMaxSize,
  },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (staticConfig.upload.allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的图片格式，仅支持 JPEG、PNG、GIF、WebP'))
    }
  },
})

/**
 * 从请求头中获取用户ID（用于权限验证）
 */
function getUserIdFromHeader(ctx: Router.RouterContext): number | undefined {
  const authHeader = ctx.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return undefined
  }
  const token = authHeader.substring(7)
  const payload = verifyToken(token)
  return payload?.userId
}

/**
 * 单张图片上传
 * POST /upload/image
 * 
 * 请求格式: multipart/form-data
 * - file: 图片文件
 * - width: (可选) 原始图片宽度
 * - height: (可选) 原始图片高度
 */
router.post('/image', upload.single('file'), async (ctx) => {
  try {
    // TODO: 后续可以添加权限验证，目前预留接口
    // const userId = getUserIdFromHeader(ctx)
    // if (!userId) {
    //   ctx.status = 401
    //   ctx.body = { code: 401, message: '请先登录', data: null }
    //   return
    // }

    const file = (ctx as any).file
    if (!file) {
      ctx.body = {
        code: 400,
        message: '请上传图片文件',
        data: null,
      }
      return
    }

    // 获取前端传递的原始尺寸（可选）
    const body = ctx.request.body as Record<string, any>
    const width = body?.width ? Number(body.width) : undefined
    const height = body?.height ? Number(body.height) : undefined

    // 处理图片
    const result = await imageService.processAndSaveImage(
      file.buffer,
      file.originalname,
      width,
      height
    )

    ctx.body = {
      code: 0,
      message: 'ok',
      data: result,
    }
  } catch (error: any) {
    console.error('图片上传失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '图片上传失败',
      data: null,
    }
  }
})

/**
 * 批量图片上传
 * POST /upload/images
 * 
 * 请求格式: multipart/form-data
 * - files: 图片文件数组
 */
router.post('/images', upload.array('files', 10), async (ctx) => {
  try {
    // TODO: 后续可以添加权限验证
    
    const files = (ctx as any).files as Array<{ buffer: Buffer; originalname: string }> | undefined
    if (!files || files.length === 0) {
      ctx.body = {
        code: 400,
        message: '请上传图片文件',
        data: null,
      }
      return
    }

    // 准备批量处理数据
    const images = files.map((file) => ({
      buffer: file.buffer,
      originalName: file.originalname,
    }))

    // 批量处理图片
    const results = await imageService.processBatchImages(images)

    ctx.body = {
      code: 0,
      message: 'ok',
      data: {
        count: results.length,
        images: results,
      },
    }
  } catch (error: any) {
    console.error('批量图片上传失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '批量图片上传失败',
      data: null,
    }
  }
})

/**
 * 删除图片
 * DELETE /upload/image
 * 
 * 请求体: { url: string }
 */
router.delete('/image', async (ctx) => {
  try {
    // TODO: 后续可以添加权限验证
    
    const { url } = ctx.request.body as { url?: string }
    if (!url) {
      ctx.body = {
        code: 400,
        message: '请提供图片URL',
        data: null,
      }
      return
    }

    const success = await imageService.deleteImage(url)
    ctx.body = {
      code: 0,
      message: success ? '删除成功' : '图片不存在',
      data: { success },
    }
  } catch (error: any) {
    console.error('删除图片失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '删除图片失败',
      data: null,
    }
  }
})

export default router
