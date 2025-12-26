<script lang="ts" setup>
/**
 * 商品列表页
 */
import type { GoodsCategory, GoodsItem, GoodsListParams, SortOption } from '@/types/goods'
import { computed, onMounted, reactive, ref } from 'vue'
import { getGoodsCategories, getGoodsList } from '@/api/goods'
import GoodsCard from '@/components/goods/GoodsCard.vue'
import GoodsFilter from '@/components/goods/GoodsFilter.vue'
import GoodsSearch from '@/components/goods/GoodsSearch.vue'
import { useUserStore } from '@/store/user'

defineOptions({
  name: 'GoodsList',
})

definePage({
  type: 'home',
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '商品',
  },
})

// 获取系统信息，计算状态栏高度
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = computed(() => systemInfo.statusBarHeight || 44)

const userStore = useUserStore()

// z-paging 实例
const paging = ref<ZPagingInstance | null>(null)

// 瀑布流相关状态
const leftList = ref<GoodsItem[]>([])
const rightList = ref<GoodsItem[]>([])
const leftHeight = ref(0)
const rightHeight = ref(0)
// 内容区域固定高度（标题 + 价格 + 库存 + padding）
const CONTENT_HEIGHT = 120

// 排序选项
const sortOptions: SortOption[] = [
  { label: '默认排序', field: 'createdAt', order: 'desc' },
  { label: '价格升序', field: 'price', order: 'asc' },
  { label: '价格降序', field: 'price', order: 'desc' },
]

// 查询参数
const params = reactive<GoodsListParams>({
  keyword: '',
  categoryIds: undefined,
  supportPoints: undefined,
  sortField: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
})

// 分类列表
const categories = ref<GoodsCategory[]>([])

// 当前排序
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
 * 加载分类列表
 */
async function loadCategories() {
  try {
    const result = await getGoodsCategories()
    categories.value = result
  }
  catch (error) {
    console.error('加载分类失败:', error)
  }
}

/**
 * z-paging 查询回调
 */
async function queryList(pageNo: number, pageSize: number) {
  try {
    const result = await getGoodsList({
      ...params,
      page: pageNo,
      pageSize,
    })
    // 通知 z-paging 数据加载完成
    paging.value?.complete(result.list)
  }
  catch (error) {
    console.error('加载商品列表失败:', error)
    // 加载失败时通知 z-paging
    paging.value?.complete(false)
  }
}

/**
 * 获取商品卡片高度
 * 直接使用后端返回的 imageHeight + 固定内容区域高度
 */
function getCardHeight(goods: GoodsItem): number {
  // 图片高度直接使用后端返回的值，默认450
  const imageHeight = goods.imageHeight || 450
  // 前端图片宽度约为335rpx，按比例转换后端450px的高度
  const scale = 335 / 450
  const scaledImageHeight = Math.round(imageHeight * scale)
  return scaledImageHeight + CONTENT_HEIGHT
}

// 将商品分配到左右两列
function distributeGoods(list: GoodsItem[]) {
  console.log('========== 开始分配商品 ==========')
  console.log('商品总数:', list.length)

  leftList.value = []
  rightList.value = []
  leftHeight.value = 0
  rightHeight.value = 0

  list.forEach((goods, index) => {
    // 直接使用后端返回的高度计算卡片高度
    const cardHeight = getCardHeight(goods)

    console.log(`[商品${index + 1}] ${goods.name}`)
    console.log(`  - 后端图片高度: ${goods.imageHeight || 450}px`)
    console.log(`  - 卡片总高度: ${cardHeight}`)
    console.log(`  - 分配前: 左列=${leftHeight.value}, 右列=${rightHeight.value}`)

    // 根据左右列高度分配，哪一列短就分配到哪一列
    if (leftHeight.value <= rightHeight.value) {
      leftList.value.push(goods)
      leftHeight.value += cardHeight
      console.log(`  - 分配到: 左列`)
    }
    else {
      rightList.value.push(goods)
      rightHeight.value += cardHeight
      console.log(`  - 分配到: 右列`)
    }

    console.log(`  - 分配后: 左列=${leftHeight.value}, 右列=${rightHeight.value}`)
  })

  console.log('========== 分配结果 ==========')
  console.log('左列商品数:', leftList.value.length, '总高度:', leftHeight.value)
  console.log('右列商品数:', rightList.value.length, '总高度:', rightHeight.value)
  console.log('高度差:', Math.abs(leftHeight.value - rightHeight.value))
}

onMounted(() => {
  // 加载分类列表
  loadCategories()
})

// 搜索
function handleSearch(value: string) {
  params.keyword = value
  paging.value?.reload()
}

// 清空搜索
function handleClearSearch() {
  params.keyword = ''
  paging.value?.reload()
}

// 分类筛选变化（支持多选）
function handleCategoryChange(ids: number[] | undefined) {
  params.categoryIds = ids
}

// 积分筛选变化
function handlePointsChange(value: boolean | undefined) {
  params.supportPoints = value
}

// 筛选确认
function handleFilterConfirm() {
  paging.value?.reload()
}

// 排序变化
function handleSortChange(sort: SortOption) {
  currentSort.value = sort
  params.sortField = sort.field
  params.sortOrder = sort.order
  paging.value?.reload()
}

// 点击商品
function handleGoodsClick(goods: GoodsItem) {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}`,
  })
}
</script>

<template>
  <view class="goods-list-page">
    <!-- 顶部安全区域 -->
    <view class="status-bar" :style="{ height: `${statusBarHeight}px` }" />

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">商品中心</text>
    </view>

    <!-- 搜索栏 -->
    <GoodsSearch
      :model-value="params.keyword"
      placeholder="搜索商品名称"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- 筛选栏 -->
    <GoodsFilter
      :categories="categories"
      :category-ids="params.categoryIds"
      :support-points="params.supportPoints"
      :sort-options="sortOptions"
      :current-sort="currentSort"
      @update:category-ids="handleCategoryChange"
      @update:support-points="handlePointsChange"
      @update:current-sort="handleSortChange"
      @confirm="handleFilterConfirm"
    />

    <!-- 商品列表 - 使用 z-paging 实现下拉刷新/上拉加载 -->
    <z-paging
      ref="paging"
      class="goods-paging"
      :fixed="false"
      :use-page-scroll="false"
      :default-page-size="10"
      :auto="true"
      :show-scrollbar="false"
      :safe-area-inset-bottom="true"
      empty-view-text="暂无相关商品"
      @query="queryList"
      @list-change="distributeGoods"
    >
      <view class="waterfall-container">
        <!-- 左列 -->
        <view class="waterfall-column waterfall-column-left">
          <view
            v-for="goods in leftList"
            :key="goods.id"
            class="waterfall-item"
          >
            <GoodsCard
              :goods="goods"
              :price="getGoodsPrice(goods)"
              :waterfall="true"
              @click="handleGoodsClick"
            />
          </view>
        </view>

        <!-- 右列 -->
        <view class="waterfall-column waterfall-column-right">
          <view
            v-for="goods in rightList"
            :key="goods.id"
            class="waterfall-item"
          >
            <GoodsCard
              :goods="goods"
              :price="getGoodsPrice(goods)"
              :waterfall="true"
              @click="handleGoodsClick"
            />
          </view>
        </view>
      </view>
    </z-paging>
  </view>
</template>

<style lang="scss" scoped>
.goods-list-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  overflow: hidden;
}

.status-bar {
  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%);
  // 高度通过动态样式设置
}

.page-header {
  background: linear-gradient(180deg, #eff6ff 0%, #fff 100%);
  padding: 24rpx 32rpx 32rpx;

  .page-title {
    font-size: 44rpx;
    font-weight: 700;
    color: #1e293b;
  }
}

.goods-paging {
  flex: 1;
  height: 0;
  overflow: hidden;
}

// 瀑布流容器
.waterfall-container {
  display: flex;
  padding: 20rpx;
  gap: 20rpx;
}

// 瀑布流列
.waterfall-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

// 瀑布流单项
.waterfall-item {
  width: 100%;
}
</style>
