<script lang="ts" setup>
/**
 * 商品筛选组件
 */
import type { GoodsCategory, SortOption } from '@/types/goods'
import { computed, ref } from 'vue'

interface Props {
  /** 分类列表 */
  categories: GoodsCategory[]
  /** 当前选中的分类ID列表（支持多选） */
  categoryIds?: number[]
  /** 是否只显示支持积分兑换 */
  supportPoints?: boolean
  /** 排序选项列表 */
  sortOptions: SortOption[]
  /** 当前排序 */
  currentSort: SortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:categoryIds', value: number[] | undefined): void
  (e: 'update:supportPoints', value: boolean | undefined): void
  (e: 'update:currentSort', value: SortOption): void
  (e: 'confirm'): void
  (e: 'reset'): void
}>()

// 是否显示筛选弹窗
const showFilter = ref(false)
// 是否显示排序弹窗
const showSort = ref(false)

// 临时选中状态
const tempCategoryIds = ref<number[]>(props.categoryIds ?? [])
const tempSupportPoints = ref<boolean | undefined>(props.supportPoints)

// 是否有筛选条件
const hasFilter = computed(() => {
  return (props.categoryIds && props.categoryIds.length > 0) || props.supportPoints !== undefined
})

// 打开筛选弹窗
function openFilter() {
  tempCategoryIds.value = props.categoryIds ? [...props.categoryIds] : []
  tempSupportPoints.value = props.supportPoints
  showFilter.value = true
}

// 选择分类（多选）
function selectCategory(id: number) {
  const index = tempCategoryIds.value.indexOf(id)
  if (index > -1) {
    // 已选中，移除
    tempCategoryIds.value.splice(index, 1)
  }
  else {
    // 未选中，添加
    tempCategoryIds.value.push(id)
  }
}

// 切换积分兑换筛选
function togglePoints() {
  tempSupportPoints.value = tempSupportPoints.value ? undefined : true
}

// 重置筛选
function resetFilter() {
  tempCategoryIds.value = []
  tempSupportPoints.value = undefined
}

// 确认筛选
function confirmFilter() {
  emit('update:categoryIds', tempCategoryIds.value.length > 0 ? [...tempCategoryIds.value] : undefined)
  emit('update:supportPoints', tempSupportPoints.value)
  showFilter.value = false
  // 确认后触发加载
  emit('confirm')
}

// 选择排序
function selectSort(sort: SortOption) {
  emit('update:currentSort', sort)
  showSort.value = false
}

// 关闭弹窗
function closePopup() {
  showSort.value = false
  showFilter.value = false
}
</script>

<template>
  <view class="filter-bar">
    <!-- 排序按钮 -->
    <view class="filter-item" @tap="showSort = true">
      <text class="filter-text">{{ currentSort.label }}</text>
      <wd-icon name="arrow-down" size="14px" color="#666" />
    </view>

    <!-- 筛选按钮 -->
    <view class="filter-item" :class="{ active: hasFilter }" @tap="openFilter">
      <wd-icon name="filter" size="16px" :color="hasFilter ? '#3b82f6' : '#666'" />
      <text class="filter-text" :class="{ active: hasFilter }">筛选</text>
    </view>
  </view>

  <!-- 统一的弹窗容器 -->
  <page-container
    :show="showSort || showFilter"
    position="bottom"
    round
    :overlay="true"
    @clickoverlay="closePopup"
  >
    <!-- 排序弹窗内容 -->
    <view v-if="showSort" class="sort-popup">
      <!-- 顶部把手 -->
      <view class="popup-handle" />

      <view class="popup-header">
        <text class="popup-title">排序方式</text>
      </view>

      <view class="sort-list">
        <view
          v-for="sort in sortOptions"
          :key="sort.label"
          class="sort-item"
          :class="{ active: currentSort.label === sort.label }"
          @tap="selectSort(sort)"
        >
          <text class="sort-text">{{ sort.label }}</text>
          <view v-if="currentSort.label === sort.label" class="check-icon">
            <wd-icon name="check" size="20px" color="#3b82f6" />
          </view>
        </view>
      </view>

      <!-- 底部安全区域 -->
      <view class="popup-safe-area" />
    </view>

    <!-- 筛选弹窗内容 -->
    <view v-if="showFilter" class="filter-popup">
      <!-- 顶部把手 -->
      <view class="popup-handle" />

      <view class="popup-header">
        <text class="popup-title">筛选条件</text>
        <view class="popup-reset" @tap="resetFilter">
          <text class="reset-text">重置</text>
        </view>
      </view>

      <scroll-view class="filter-content" scroll-y enhanced>
        <!-- 分类筛选 -->
        <view v-if="categories.length > 0" class="filter-section">
          <view class="section-title-wrapper">
            <view class="section-title-line" />
            <text class="section-title">商品分类</text>
            <view class="section-title-line" />
          </view>
          <view class="category-grid">
            <view
              v-for="cat in categories"
              :key="cat.id"
              class="category-item"
              :class="{ active: tempCategoryIds.includes(cat.id) }"
              @tap="selectCategory(cat.id)"
            >
              <text class="category-text">{{ cat.name }}</text>
              <view v-if="tempCategoryIds.includes(cat.id)" class="category-check">
                <wd-icon name="check" size="16px" color="#fff" />
              </view>
            </view>
          </view>
        </view>

        <!-- 积分兑换筛选 -->
        <view class="filter-section">
          <view class="section-title-wrapper">
            <view class="section-title-line" />
            <text class="section-title">其他筛选</text>
            <view class="section-title-line" />
          </view>
          <view class="tag-list">
            <view class="filter-tag" :class="{ active: tempSupportPoints }" @tap="togglePoints">
              <text class="tag-text">支持积分兑换</text>
              <view v-if="tempSupportPoints" class="tag-check">
                <wd-icon name="check" size="16px" color="#fff" />
              </view>
            </view>
          </view>
        </view>

        <!-- 底部占位，避免被 tabbar 遮挡 -->
        <view class="tabbar-spacer" />
      </scroll-view>

      <!-- 确认按钮 -->
      <view class="filter-footer">
        <button class="confirm-btn" @tap="confirmFilter">
          <text class="btn-text">确定 </text>
        </button>
      </view>

      <!-- 底部安全区域 + tabbar 高度 -->
      <view class="popup-safe-area" />
    </view>
  </page-container>
</template>

<style lang="scss" scoped>
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16rpx 24rpx;
  background: #fff;
  gap: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8rpx;

  .filter-text {
    font-size: 28rpx;
    color: #666;

    &.active {
      color: #3b82f6;
    }
  }

  &:active {
    opacity: 0.7;
  }
}

// 排序弹窗
.sort-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;

  // 顶部把手
  .popup-handle {
    width: 80rpx;
    height: 8rpx;
    background: #e5e7eb;
    border-radius: 4rpx;
    margin: 16rpx auto 0;
  }

  .popup-header {
    padding: 24rpx 32rpx;
    text-align: center;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .sort-list {
    padding: 16rpx 0;
    margin-bottom: 100rpx; /* tabbar 高度 */
  }

  .sort-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;
    transition: background 0.2s;

    .sort-text {
      font-size: 30rpx;
      color: #374151;
    }

    .check-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44rpx;
      height: 44rpx;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-radius: 50%;
    }

    &.active {
      .sort-text {
        color: #3b82f6;
        font-weight: 600;
      }
    }

    &:active {
      background: #f9fafb;
    }
  }

  // 底部安全区域 + tabbar 高度
  .popup-safe-area {
    height: calc(env(safe-area-inset-bottom) + 100rpx);
    background: #fff;
  }
}

// 筛选弹窗
.filter-popup {
  background: #fff;
  border-radius: 32rpx 32rpx 0 0;
  max-height: 70vh;
  display: flex;
  flex-direction: column;

  // 顶部把手
  .popup-handle {
    width: 80rpx;
    height: 8rpx;
    background: #e5e7eb;
    border-radius: 4rpx;
    margin: 16rpx auto 0;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .popup-reset {
      display: flex;
      align-items: center;
      padding: 8rpx 20rpx;
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-radius: 32rpx;

      .reset-text {
        font-size: 26rpx;
        color: #3b82f6;
        font-weight: 500;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }

  .filter-content {
    flex: 1;
    overflow-y: auto;
  }

  .filter-section {
    padding: 32rpx;

    .section-title-wrapper {
      display: flex;
      align-items: center;
      gap: 16rpx;
      margin-bottom: 24rpx;

      .section-title {
        font-size: 28rpx;
        color: #1e293b;
        font-weight: 600;
        white-space: nowrap;
      }

      .section-title-line {
        flex: 1;
        height: 1rpx;
        background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
      }
    }
  }

  // 底部占位，避免被 tabbar 遮挡
  .tabbar-spacer {
    height: 100rpx;
  }

  .category-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .category-item {
    position: relative;
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    overflow: hidden;

    .category-text {
      font-size: 28rpx;
      color: #374151;
      position: relative;
      z-index: 1;
    }

    .category-check {
      position: absolute;
      right: -8rpx;
      top: -8rpx;
      width: 36rpx;
      height: 36rpx;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
    }

    &.active {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-color: #3b82f6;
      transform: translateY(-2rpx);
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);

      .category-text {
        color: #3b82f6;
        font-weight: 600;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .filter-tag {
    position: relative;
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-radius: 16rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s;
    overflow: hidden;

    .tag-text {
      font-size: 28rpx;
      color: #374151;
      position: relative;
      z-index: 1;
    }

    .tag-check {
      position: absolute;
      right: -8rpx;
      top: -8rpx;
      width: 36rpx;
      height: 36rpx;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
    }

    &.active {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-color: #3b82f6;
      transform: translateY(-2rpx);
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.15);

      .tag-text {
        color: #3b82f6;
        font-weight: 600;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .filter-footer {
    padding: 24rpx 32rpx;
    border-top: 1rpx solid #f0f0f0;
    flex-shrink: 0;
    margin-bottom: 100rpx; /* tabbar 高度 */

    .confirm-btn {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 44rpx;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.3);
      transition: all 0.3s;

      .btn-text {
        color: #fff;
        font-size: 32rpx;
        font-weight: 600;
      }

      &:active {
        transform: scale(0.98);
        box-shadow: 0 4rpx 16rpx rgba(59, 130, 246, 0.4);
      }
    }
  }

  // 底部安全区域
  .popup-safe-area {
    height: calc(env(safe-area-inset-bottom) + 100rpx); /* 安全区域 + tabbar 高度 */
    background: #fff;
  }
}
</style>
