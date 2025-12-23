/**
 * 商品相关 API
 */
import { httpGet, httpPost, httpDelete } from '@/http/http'
import type { GoodsItem, GoodsListParams, GoodsListResponse, GoodsCategory } from '@/types/goods'

/**
 * 获取商品列表
 */
export function getGoodsList(params: GoodsListParams): Promise<GoodsListResponse> {
  return httpGet('/goods/list', params)
}

/**
 * 获取商品详情
 */
export function getGoodsDetail(id: number): Promise<GoodsItem> {
  return httpGet(`/goods/detail/${id}`)
}

/**
 * 获取商品分类列表
 */
export function getGoodsCategories(): Promise<GoodsCategory[]> {
  return httpGet('/goods/categories')
}

/**
 * 收藏商品
 */
export function favoriteGoods(goodsId: number): Promise<void> {
  return httpPost('/goods/favorite', { goodsId })
}

/**
 * 取消收藏商品
 */
export function unfavoriteGoods(goodsId: number): Promise<void> {
  return httpDelete(`/goods/favorite/${goodsId}`)
}

/**
 * 添加到购物车
 */
export function addToCart(goodsId: number, quantity: number = 1): Promise<void> {
  return httpPost('/cart/add', { goodsId, quantity })
}
