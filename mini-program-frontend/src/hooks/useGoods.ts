/**
 * 商品模块业务逻辑 Hook
 */
import { ref, computed, reactive } from 'vue'
import { useUserStore } from '@/store/user'
import type { GoodsItem, GoodsListParams, GoodsCategory, SortOption } from '@/types/goods'

/** 排序选项列表 */
export const sortOptions: SortOption[] = [
  { label: '默认排序', field: 'createdAt', order: 'desc' },
  { label: '价格升序', field: 'price', order: 'asc' },
  { label: '价格降序', field: 'price', order: 'desc' },
]

/**
 * 商品列表 Hook
 */
export function useGoodsList() {
  const userStore = useUserStore()

  // 列表数据
  const goodsList = ref<GoodsItem[]>([])
  const loading = ref(false)
  const refreshing = ref(false)
  const hasMore = ref(true)

  // 查询参数
  const params = reactive<GoodsListParams>({
    keyword: '',
    categoryId: undefined,
    supportPoints: undefined,
    sortField: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    pageSize: 10,
  })

  // 分类列表
  const categories = ref<GoodsCategory[]>([])

  // 当前选中的排序
  const currentSort = ref<SortOption>(sortOptions[0])

  /**
   * 根据用户等级获取商品价格
   */
  function getGoodsPrice(goods: GoodsItem): number {
    const userLevel = userStore.userInfo?.level || 1
    const priceKey = `price${userLevel}` as keyof GoodsItem
    return (goods[priceKey] as number) || goods.price1
  }

  /**
   * 格式化价格显示
   */
  function formatPrice(price: number): string {
    return price.toFixed(2)
  }

  /**
   * 重置筛选条件
   */
  function resetFilters() {
    params.keyword = ''
    params.categoryId = undefined
    params.supportPoints = undefined
    params.sortField = 'createdAt'
    params.sortOrder = 'desc'
    params.page = 1
    currentSort.value = sortOptions[0]
  }

  /**
   * 设置搜索关键词
   */
  function setKeyword(keyword: string) {
    params.keyword = keyword
    params.page = 1
  }

  /**
   * 设置分类筛选
   */
  function setCategory(categoryId: number | undefined) {
    params.categoryId = categoryId
    params.page = 1
  }

  /**
   * 设置积分兑换筛选
   */
  function setSupportPoints(value: boolean | undefined) {
    params.supportPoints = value
    params.page = 1
  }

  /**
   * 设置排序
   */
  function setSort(sort: SortOption) {
    currentSort.value = sort
    params.sortField = sort.field
    params.sortOrder = sort.order
    params.page = 1
  }

  return {
    // 数据
    goodsList,
    loading,
    refreshing,
    hasMore,
    params,
    categories,
    currentSort,
    sortOptions,
    // 方法
    getGoodsPrice,
    formatPrice,
    resetFilters,
    setKeyword,
    setCategory,
    setSupportPoints,
    setSort,
  }
}

/**
 * 商品详情 Hook
 */
export function useGoodsDetail() {
  const userStore = useUserStore()

  const goods = ref<GoodsItem | null>(null)
  const loading = ref(false)

  /**
   * 根据用户等级获取商品价格
   */
  function getGoodsPrice(): number {
    if (!goods.value) return 0
    const userLevel = userStore.userInfo?.level || 1
    const priceKey = `price${userLevel}` as keyof GoodsItem
    return (goods.value[priceKey] as number) || goods.value.price1
  }

  /**
   * 格式化价格显示
   */
  function formatPrice(price: number): string {
    return price.toFixed(2)
  }

  /**
   * 切换收藏状态
   */
  async function toggleFavorite() {
    if (!goods.value) return
    goods.value.isFavorite = !goods.value.isFavorite
    // TODO: 调用收藏/取消收藏 API
  }

  return {
    goods,
    loading,
    getGoodsPrice,
    formatPrice,
    toggleFavorite,
  }
}
