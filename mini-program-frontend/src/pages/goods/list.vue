<script lang="ts" setup>
/**
 * 商品列表页
 */
import type { GoodsItem } from '@/types/goods'
import { computed, onMounted, ref, watch } from 'vue'
import GoodsCard from '@/components/goods/GoodsCard.vue'
import GoodsFilter from '@/components/goods/GoodsFilter.vue'
import GoodsSearch from '@/components/goods/GoodsSearch.vue'
import { sortOptions, useGoodsList } from '@/hooks/useGoods'

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
  hasMore,
  getGoodsPrice,
  setKeyword,
  setCategory,
  setSupportPoints,
  setSort,
  loadCategories,
  loadGoodsList,
  loadMore,
} = useGoodsList()

// 瀑布流相关状态
const leftList = ref<GoodsItem[]>([])
const rightList = ref<GoodsItem[]>([])

// 将商品分配到左右两列（简化版，只用索引分配）
function distributeGoods() {
  leftList.value = []
  rightList.value = []

  goodsList.value.forEach((goods, index) => {
    // 奇数放左边，偶数放右边
    if (index % 2 === 0) {
      leftList.value.push(goods)
    }
    else {
      rightList.value.push(goods)
    }
  })
}

// 监听商品列表变化，重新分配
watch(goodsList, () => {
  distributeGoods()
}, { immediate: true })

onMounted(() => {
  // 加载分类和商品列表
  loadCategories()
  loadGoodsList(true)
})

// 搜索
function handleSearch(value: string) {
  setKeyword(value)
  loadGoodsList(true)
}

// 清空搜索
function handleClearSearch() {
  setKeyword('')
  loadGoodsList(true)
}

// 分类筛选变化（支持多选）
function handleCategoryChange(ids: number[] | undefined) {
  setCategory(ids)
}

// 积分筛选变化
function handlePointsChange(value: boolean | undefined) {
  setSupportPoints(value)
}

// 筛选确认
function handleFilterConfirm() {
  loadGoodsList(true)
}

// 排序变化
function handleSortChange(sort: typeof currentSort.value) {
  setSort(sort)
  loadGoodsList(true)
}

// 点击商品
function handleGoodsClick(goods: GoodsItem) {
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}`,
  })
}

// 上拉加载更多
function handleScrollToLower() {
  loadMore()
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

    <!-- 商品列表 - 瀑布流 -->
    <scroll-view
      class="goods-scroll"
      scroll-y
      enhanced
      :show-scrollbar="false"
      @scrolltolower="handleScrollToLower"
    >
      <view class="waterfall-container">
        <!-- 左列 -->
        <view class="waterfall-column">
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
        <view class="waterfall-column">
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

      <!-- 底部提示 -->
      <view v-if="goodsList.length > 0 && !hasMore" class="list-footer">
        <text>已加载全部商品</text>
      </view>

      <!-- 加载中 -->
      <view v-if="loading && goodsList.length > 0" class="list-footer">
        <wd-loading size="20px" />
        <text>加载中...</text>
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

.goods-scroll {
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
