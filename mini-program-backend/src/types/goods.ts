/**
 * 商品模块类型定义
 */

/** 商品分类 */
export interface GoodsCategory {
  id: number
  name: string
  icon?: string | null
  sortOrder?: number
  status?: number
  createdAt?: string
  updatedAt?: string
}

/** 商品信息 */
export interface GoodsItem {
  id: number
  name: string
  /** 商品主图 */
  image: string
  /** 商品图片列表（轮播图） */
  images?: string[] | null
  /** 商品简介 */
  description?: string | null
  /** 商品规格/型号 */
  spec?: string | null
  /** 分类ID */
  categoryId: number
  /** 分类名称 */
  categoryName?: string
  /** 库存数量 */
  stock: number
  /** 是否显示库存 */
  showStock: boolean
  /** 1级客户价格 */
  price1: number
  /** 2级客户价格 */
  price2: number
  /** 3级客户价格 */
  price3: number
  /** 4级客户价格 */
  price4: number
  /** 是否支持积分兑换 */
  supportPoints: boolean
  /** 积分兑换所需积分 */
  pointsPrice?: number | null
  /** 是否已收藏（动态计算） */
  isFavorite?: boolean
  /** 状态 */
  status?: number
  /** 排序值 */
  sortOrder?: number
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/** 商品列表查询参数 */
export interface GoodsListParams {
  /** 关键词搜索 */
  keyword?: string
  /** 分类ID */
  categoryId?: number
  /** 是否支持积分兑换 */
  supportPoints?: boolean
  /** 排序字段 */
  sortField?: 'price' | 'createdAt'
  /** 排序方式 */
  sortOrder?: 'asc' | 'desc'
  /** 页码 */
  page?: number
  /** 每页数量 */
  pageSize?: number
  /** 用户等级（用于价格排序） */
  userLevel?: number
}

/** 商品列表响应 */
export interface GoodsListResponse {
  list: GoodsItem[]
  total: number
  page: number
  pageSize: number
}

/** 数据库商品记录（蛇形命名） */
export interface GoodsRecord {
  id: number
  name: string
  image: string
  images: string | null
  description: string | null
  spec: string | null
  category_id: number
  category_name?: string
  stock: number
  show_stock: number
  price1: number
  price2: number
  price3: number
  price4: number
  support_points: number
  points_price: number | null
  status: number
  sort_order: number
  created_at: string
  updated_at: string
}

/** 数据库分类记录（蛇形命名） */
export interface CategoryRecord {
  id: number
  name: string
  icon: string | null
  sort_order: number
  status: number
  created_at: string
  updated_at: string
}
