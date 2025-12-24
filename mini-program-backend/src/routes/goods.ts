/**
 * 商品路由
 */
import Router from 'koa-router'
import { verifyToken } from '../utils/jwt'
import * as goodsService from '../services/goods'
import type { GoodsListParams } from '../types/goods'

const router = new Router({
  prefix: '/goods',
})

/**
 * 从请求头中获取用户ID（可选认证）
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
 * 从请求头中获取用户等级
 */
async function getUserLevelFromHeader(ctx: Router.RouterContext): Promise<number> {
  const userId = getUserIdFromHeader(ctx)
  if (!userId) {
    return 1 // 默认1级
  }
  // TODO: 可以从缓存或数据库获取用户等级
  // 这里简化处理，直接返回1
  return 1
}

/**
 * 获取商品分类列表
 * GET /goods/categories
 */
router.get('/categories', async (ctx) => {
  try {
    const categories = await goodsService.getCategories()
    ctx.body = {
      code: 0,
      message: 'ok',
      data: categories,
    }
  } catch (error: any) {
    console.error('获取商品分类失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取分类失败',
      data: null,
    }
  }
})

/**
 * 获取商品列表
 * GET /goods/list
 */
router.get('/list', async (ctx) => {
  try {
    const {
      keyword,
      categoryId,
      supportPoints,
      sortField,
      sortOrder,
      page,
      pageSize,
    } = ctx.query as Record<string, string | undefined>

    const userId = getUserIdFromHeader(ctx)
    const userLevel = await getUserLevelFromHeader(ctx)

    const params: GoodsListParams = {
      keyword: keyword || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      supportPoints: supportPoints === 'true' ? true : supportPoints === 'false' ? false : undefined,
      sortField: sortField === 'price' || sortField === 'createdAt' ? sortField : undefined,
      sortOrder: sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      userLevel,
    }

    const result = await goodsService.getGoodsList(params, userId)
    ctx.body = {
      code: 0,
      message: 'ok',
      data: result,
    }
  } catch (error: any) {
    console.error('获取商品列表失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取商品列表失败',
      data: null,
    }
  }
})

/**
 * 获取商品详情
 * GET /goods/detail/:id
 */
router.get('/detail/:id', async (ctx) => {
  try {
    const goodsId = Number(ctx.params.id)
    if (!goodsId || isNaN(goodsId)) {
      ctx.body = {
        code: 400,
        message: '商品ID无效',
        data: null,
      }
      return
    }

    const userId = getUserIdFromHeader(ctx)
    const goods = await goodsService.getGoodsDetail(goodsId, userId)

    if (!goods) {
      ctx.body = {
        code: 404,
        message: '商品不存在',
        data: null,
      }
      return
    }

    ctx.body = {
      code: 0,
      message: 'ok',
      data: goods,
    }
  } catch (error: any) {
    console.error('获取商品详情失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取商品详情失败',
      data: null,
    }
  }
})

/**
 * 收藏商品
 * POST /goods/favorite
 */
router.post('/favorite', async (ctx) => {
  try {
    const userId = getUserIdFromHeader(ctx)
    if (!userId) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        message: '请先登录',
        data: null,
      }
      return
    }

    const { goodsId } = ctx.request.body as { goodsId: number }
    if (!goodsId) {
      ctx.body = {
        code: 400,
        message: '商品ID不能为空',
        data: null,
      }
      return
    }

    await goodsService.favoriteGoods(userId, goodsId)
    ctx.body = {
      code: 0,
      message: 'ok',
      data: null,
    }
  } catch (error: any) {
    console.error('收藏商品失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '收藏失败',
      data: null,
    }
  }
})

/**
 * 取消收藏商品
 * DELETE /goods/favorite/:id
 */
router.delete('/favorite/:id', async (ctx) => {
  try {
    const userId = getUserIdFromHeader(ctx)
    if (!userId) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        message: '请先登录',
        data: null,
      }
      return
    }

    const goodsId = Number(ctx.params.id)
    if (!goodsId || isNaN(goodsId)) {
      ctx.body = {
        code: 400,
        message: '商品ID无效',
        data: null,
      }
      return
    }

    await goodsService.unfavoriteGoods(userId, goodsId)
    ctx.body = {
      code: 0,
      message: 'ok',
      data: null,
    }
  } catch (error: any) {
    console.error('取消收藏失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '取消收藏失败',
      data: null,
    }
  }
})

/**
 * 获取用户收藏列表
 * GET /goods/favorites
 */
router.get('/favorites', async (ctx) => {
  try {
    const userId = getUserIdFromHeader(ctx)
    if (!userId) {
      ctx.status = 401
      ctx.body = {
        code: 401,
        message: '请先登录',
        data: null,
      }
      return
    }

    const { page, pageSize } = ctx.query as Record<string, string | undefined>
    const result = await goodsService.getUserFavorites(
      userId,
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 10
    )

    ctx.body = {
      code: 0,
      message: 'ok',
      data: result,
    }
  } catch (error: any) {
    console.error('获取收藏列表失败:', error)
    ctx.body = {
      code: -1,
      message: error.message || '获取收藏列表失败',
      data: null,
    }
  }
})

export default router
