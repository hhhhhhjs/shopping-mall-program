<script lang="ts" setup>
/**
 * 商品列表页
 */
import { ref, onMounted, computed } from 'vue'
import { useGoodsList, sortOptions } from '@/hooks/useGoods'
import type { GoodsItem, GoodsCategory } from '@/types/goods'
import GoodsCard from '@/components/goods/GoodsCard.vue'
import GoodsSearch from '@/components/goods/GoodsSearch.vue'
import GoodsFilter from '@/components/goods/GoodsFilter.vue'

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

const {
  goodsList,
  loading,
  params,
  categories,
  currentSort,
  getGoodsPrice,
  setKeyword,
  setCategory,
  setSupportPoints,
  setSort,
} = useGoodsList()

// 搜索关键词
const keyword = ref('')

// 模拟数据
const mockCategories: GoodsCategory[] = [
  { id: 1, name: '办公用品' },
  { id: 2, name: '电子设备' },
  { id: 3, name: '劳保用品' },
  { id: 4, name: '清洁用品' },
  { id: 5, name: '包装材料' },
]

const mockGoodsList: GoodsItem[] = [
  {
    id: 1,
    name: 'A4打印纸 70g 500张/包 办公用纸',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 1,
    stock: 1000,
    showStock: false,
    price1: 28.00,
    price2: 26.00,
    price3: 24.00,
    price4: 22.00,
    supportPoints: true,
    pointsPrice: 280,
  },
  {
    id: 2,
    name: '中性笔黑色0.5mm 办公签字笔 12支装',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 1,
    stock: 500,
    showStock: true,
    price1: 15.00,
    price2: 14.00,
    price3: 13.00,
    price4: 12.00,
    supportPoints: false,
  },
  {
    id: 3,
    name: '无线蓝牙鼠标 静音办公 可充电',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 2,
    stock: 200,
    showStock: true,
    price1: 89.00,
    price2: 85.00,
    price3: 80.00,
    price4: 75.00,
    supportPoints: true,
    pointsPrice: 890,
  },
  {
    id: 4,
    name: '机械键盘 青轴104键 办公游戏两用',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 2,
    stock: 150,
    showStock: false,
    price1: 199.00,
    price2: 189.00,
    price3: 179.00,
    price4: 169.00,
    supportPoints: false,
  },
  {
    id: 5,
    name: '防护手套 乳胶手套 一次性 100只装',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 3,
    stock: 800,
    showStock: true,
    price1: 35.00,
    price2: 32.00,
    price3: 30.00,
    price4: 28.00,
    supportPoints: true,
    pointsPrice: 350,
  },
  {
    id: 6,
    name: '安全帽 ABS材质 防砸防撞 工地施工',
    image: 'https://img.yzcdn.cn/vant/cat.jpeg',
    categoryId: 3,
    stock: 300,
    showStock: false,
    price1: 45.00,
    price2: 42.00,
    price3: 40.00,
    price4: 38.00,
    supportPoints: false,
  },
]

onMounted(() => {
  // 模拟加载数据
  categories.value = mockCategories
  goodsList.value = mockGoodsList
})

// 搜索
function handleSearch(value: string) {
  setKeyword(value)
  // TODO: 调用 API 获取数据
  console.log('搜索:', value)
}

// 清空搜索
function handleClearSearch() {
  setKeyword('')
  // TODO: 重新加载数据
}

// 分类筛选变化
function handleCategoryChange(id: number | undefined) {
  setCategory(id)
  // TODO: 重新加载数据
}

// 积分筛选变化
function handlePointsChange(value: boolean | undefined) {
  setSupportPoints(value)
  // TODO: 重新加载数据
}

// 排序变化
function handleSortChange(sort: typeof currentSort.value) {
  setSort(sort)
  // TODO: 重新加载数据
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
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }" />

    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">商品中心</text>
    </view>

    <!-- 搜索栏 -->
    <GoodsSearch
      v-model="keyword"
      placeholder="搜索商品名称"
      @search="handleSearch"
      @clear="handleClearSearch"
    />

    <!-- 筛选栏 -->
    <GoodsFilter
      :categories="categories"
      :category-id="params.categoryId"
      :support-points="params.supportPoints"
      :sort-options="sortOptions"
      :current-sort="currentSort"
      @update:category-id="handleCategoryChange"
      @update:support-points="handlePointsChange"
      @update:current-sort="handleSortChange"
    />

    <!-- 商品列表 -->
    <scroll-view
      class="goods-scroll"
      scroll-y
      enhanced
      :show-scrollbar="false"
    >
      <view class="goods-grid">
        <view
          v-for="goods in goodsList"
          :key="goods.id"
          class="goods-grid-item"
        >
          <GoodsCard
            :goods="goods"
            :price="getGoodsPrice(goods)"
            @click="handleGoodsClick"
          />
        </view>
      </view>

      <!-- 底部提示 -->
      <view v-if="goodsList.length > 0" class="list-footer">
        <text>已加载全部商品</text>
      </view>

      <!-- 空状态 -->
      <view v-if="goodsList.length === 0 && !loading" class="empty-state">
        <wd-icon name="search" size="80px" color="#d1d5db" />
        <text class="empty-text">暂无相关商品</text>
      </view>

      <!-- 底部安全区域 -->
      <view class="bottom-safe" />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.goods-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
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

.goods-scroll {
  flex: 1;
  overflow: hidden;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }
}

.goods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
  padding: 20rpx;
}

.goods-grid-item {
  width: 100%;
}

.list-footer {
  padding: 40rpx 0;
  text-align: center;

  text {
    font-size: 26rpx;
    color: #9ca3af;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;

  .empty-text {
    margin-top: 24rpx;
    font-size: 28rpx;
    color: #9ca3af;
  }
}

.bottom-safe {
  height: calc(20rpx + env(safe-area-inset-bottom));
}
</style>
