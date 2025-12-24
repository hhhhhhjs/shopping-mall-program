/**
 * 商品服务层
 */
import pool from '../db'
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'
import type {
  GoodsItem,
  GoodsCategory,
  GoodsListParams,
  GoodsListResponse,
  GoodsRecord,
  CategoryRecord,
} from '../types/goods'

/**
 * 安全解析 images JSON 字段
 * 注意：mysql2 对 JSON 类型字段可能已自动解析为数组
 * 返回空数组而不是 null，确保前端处理一致性
 */
function parseImages(images: string | string[] | null): string[] {
  if (!images) {
    return []
  }
  // 如果已经是数组，直接返回
  if (Array.isArray(images)) {
    return images
  }
  // 如果是字符串，尝试解析 JSON
  if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

/**
 * 将数据库记录转换为前端格式
 */
function transformGoodsRecord(record: GoodsRecord): GoodsItem {
  return {
    id: record.id,
    name: record.name,
    image: record.image,
    images: parseImages(record.images),
    description: record.description,
    spec: record.spec,
    categoryId: record.category_id,
    categoryName: record.category_name,
    stock: record.stock,
    showStock: record.show_stock === 1,
    price1: Number(record.price1),
    price2: Number(record.price2),
    price3: Number(record.price3),
    price4: Number(record.price4),
    supportPoints: record.support_points === 1,
    pointsPrice: record.points_price,
    status: record.status,
    sortOrder: record.sort_order,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

/**
 * 将分类记录转换为前端格式
 */
function transformCategoryRecord(record: CategoryRecord): GoodsCategory {
  return {
    id: record.id,
    name: record.name,
    icon: record.icon,
    sortOrder: record.sort_order,
    status: record.status,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

/**
 * 获取商品分类列表
 */
export async function getCategories(): Promise<GoodsCategory[]> {
  const sql = `
    SELECT id, name, icon, sort_order, status, created_at, updated_at
    FROM goods_categories
    WHERE status = 1
    ORDER BY sort_order ASC, id ASC
  `
  const [rows] = await pool.execute<(CategoryRecord & RowDataPacket)[]>(sql)
  return rows.map(transformCategoryRecord)
}

/**
 * 获取商品列表
 */
export async function getGoodsList(
  params: GoodsListParams,
  userId?: number
): Promise<GoodsListResponse> {
  const {
    keyword,
    categoryIds,
    supportPoints,
    sortField = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    pageSize = 10,
    userLevel = 1,
  } = params

  // 构建查询条件
  const conditions: string[] = ['g.status = 1']
  const values: (string | number | boolean)[] = []

  // 关键词搜索
  if (keyword) {
    conditions.push('g.name LIKE ?')
    values.push(`%${keyword}%`)
  }

  // 分类筛选（支持多选）
  if (categoryIds && categoryIds.length > 0) {
    const placeholders = categoryIds.map(() => '?').join(', ')
    conditions.push(`g.category_id IN (${placeholders})`)
    values.push(...categoryIds)
  }

  // 积分兑换筛选
  if (supportPoints !== undefined) {
    conditions.push('g.support_points = ?')
    values.push(supportPoints ? 1 : 0)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // 构建排序
  let orderClause = 'ORDER BY g.sort_order ASC, g.id DESC'
  if (sortField === 'price') {
    // 根据用户等级选择对应的价格字段排序
    const priceField = `g.price${userLevel}`
    orderClause = `ORDER BY ${priceField} ${sortOrder.toUpperCase()}, g.sort_order ASC`
  } else if (sortField === 'createdAt') {
    orderClause = `ORDER BY g.created_at ${sortOrder.toUpperCase()}`
  }

  // 分页
  const offset = (page - 1) * pageSize

  // 查询总数
  const countSql = `
    SELECT COUNT(*) as total
    FROM goods g
    ${whereClause}
  `
  const [countResult] = await pool.execute<({ total: number } & RowDataPacket)[]>(countSql, values)
  const total = countResult[0]?.total || 0

  // 查询列表
  const listSql = `
    SELECT 
      g.id, g.name, g.image, g.images, g.description, g.spec,
      g.category_id, c.name as category_name,
      g.stock, g.show_stock,
      g.price1, g.price2, g.price3, g.price4,
      g.support_points, g.points_price,
      g.status, g.sort_order, g.created_at, g.updated_at
    FROM goods g
    LEFT JOIN goods_categories c ON g.category_id = c.id
    ${whereClause}
    ${orderClause}
    LIMIT ? OFFSET ?
  `
  const listValues = [...values, pageSize, offset]
  const [rows] = await pool.execute<(GoodsRecord & RowDataPacket)[]>(listSql, listValues)

  // 如果有用户ID，查询收藏状态
  let favoriteIds: Set<number> = new Set()
  if (userId && rows.length > 0) {
    const goodsIds = rows.map((r: GoodsRecord & RowDataPacket) => r.id)
    const favSql = `SELECT product_id FROM user_favorites WHERE user_id = ? AND product_id IN (?)`
    const [favRows] = await pool.query<({ product_id: number } & RowDataPacket)[]>(favSql, [
      userId,
      goodsIds,
    ])
    favoriteIds = new Set(favRows.map((r: { product_id: number }) => r.product_id))
  }

  const list = rows.map((record: GoodsRecord & RowDataPacket) => {
    const item = transformGoodsRecord(record)
    item.isFavorite = favoriteIds.has(record.id)
    return item
  })

  return {
    list,
    total,
    page,
    pageSize,
  }
}

/**
 * 获取商品详情
 */
export async function getGoodsDetail(goodsId: number, userId?: number): Promise<GoodsItem | null> {
  const sql = `
    SELECT 
      g.id, g.name, g.image, g.images, g.description, g.spec,
      g.category_id, c.name as category_name,
      g.stock, g.show_stock,
      g.price1, g.price2, g.price3, g.price4,
      g.support_points, g.points_price,
      g.status, g.sort_order, g.created_at, g.updated_at
    FROM goods g
    LEFT JOIN goods_categories c ON g.category_id = c.id
    WHERE g.id = ? AND g.status = 1
  `
  const [rows] = await pool.execute<(GoodsRecord & RowDataPacket)[]>(sql, [goodsId])

  if (rows.length === 0) {
    return null
  }

  const item = transformGoodsRecord(rows[0])

  // 查询收藏状态
  if (userId) {
    const favSql = `SELECT id FROM user_favorites WHERE user_id = ? AND product_id = ? LIMIT 1`
    const [favRows] = await pool.execute<RowDataPacket[]>(favSql, [userId, goodsId])
    item.isFavorite = favRows.length > 0
  } else {
    item.isFavorite = false
  }

  return item
}

/**
 * 收藏商品
 */
export async function favoriteGoods(userId: number, goodsId: number): Promise<boolean> {
  // 检查商品是否存在
  const checkSql = `SELECT id FROM goods WHERE id = ? AND status = 1`
  const [checkRows] = await pool.execute<RowDataPacket[]>(checkSql, [goodsId])
  if (checkRows.length === 0) {
    throw new Error('商品不存在')
  }

  // 检查是否已收藏
  const existSql = `SELECT id FROM user_favorites WHERE user_id = ? AND product_id = ?`
  const [existRows] = await pool.execute<RowDataPacket[]>(existSql, [userId, goodsId])
  if (existRows.length > 0) {
    return true // 已经收藏了
  }

  // 添加收藏
  const insertSql = `INSERT INTO user_favorites (user_id, product_id) VALUES (?, ?)`
  await pool.execute<ResultSetHeader>(insertSql, [userId, goodsId])
  return true
}

/**
 * 取消收藏商品
 */
export async function unfavoriteGoods(userId: number, goodsId: number): Promise<boolean> {
  const sql = `DELETE FROM user_favorites WHERE user_id = ? AND product_id = ?`
  const [result] = await pool.execute<ResultSetHeader>(sql, [userId, goodsId])
  return result.affectedRows > 0
}

/**
 * 获取用户收藏的商品列表
 */
export async function getUserFavorites(
  userId: number,
  page: number = 1,
  pageSize: number = 10
): Promise<GoodsListResponse> {
  const offset = (page - 1) * pageSize

  // 查询总数
  const countSql = `
    SELECT COUNT(*) as total
    FROM user_favorites f
    INNER JOIN goods g ON f.product_id = g.id AND g.status = 1
    WHERE f.user_id = ?
  `
  const [countResult] = await pool.execute<({ total: number } & RowDataPacket)[]>(countSql, [
    userId,
  ])
  const total = countResult[0]?.total || 0

  // 查询列表
  const listSql = `
    SELECT 
      g.id, g.name, g.image, g.images, g.description, g.spec,
      g.category_id, c.name as category_name,
      g.stock, g.show_stock,
      g.price1, g.price2, g.price3, g.price4,
      g.support_points, g.points_price,
      g.status, g.sort_order, g.created_at, g.updated_at
    FROM user_favorites f
    INNER JOIN goods g ON f.product_id = g.id AND g.status = 1
    LEFT JOIN goods_categories c ON g.category_id = c.id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
    LIMIT ? OFFSET ?
  `
  const [rows] = await pool.execute<(GoodsRecord & RowDataPacket)[]>(listSql, [
    userId,
    pageSize,
    offset,
  ])

  const list = rows.map((record: GoodsRecord & RowDataPacket) => {
    const item = transformGoodsRecord(record)
    item.isFavorite = true // 收藏列表里的商品都是已收藏的
    return item
  })

  return {
    list,
    total,
    page,
    pageSize,
  }
}
