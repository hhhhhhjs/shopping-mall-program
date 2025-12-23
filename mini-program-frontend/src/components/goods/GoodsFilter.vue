<script lang="ts" setup>
/**
 * 商品筛选组件
 */
import { ref, computed } from 'vue'
import type { GoodsCategory, SortOption } from '@/types/goods'

interface Props {
  /** 分类列表 */
  categories: GoodsCategory[]
  /** 当前选中的分类ID */
  categoryId?: number
  /** 是否只显示支持积分兑换 */
  supportPoints?: boolean
  /** 排序选项列表 */
  sortOptions: SortOption[]
  /** 当前排序 */
  currentSort: SortOption
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:categoryId', value: number | undefined): void
  (e: 'update:supportPoints', value: boolean | undefined): void
  (e: 'update:currentSort', value: SortOption): void
  (e: 'reset'): void
}>()

// 是否显示筛选弹窗
const showFilter = ref(false)
// 是否显示排序弹窗
const showSort = ref(false)

// 临时选中状态
const tempCategoryId = ref<number | undefined>(props.categoryId)
const tempSupportPoints = ref<boolean | undefined>(props.supportPoints)

// 是否有筛选条件
const hasFilter = computed(() => {
  return props.categoryId !== undefined || props.supportPoints !== undefined
})

// 打开筛选弹窗
function openFilter() {
  tempCategoryId.value = props.categoryId
  tempSupportPoints.value = props.supportPoints
  showFilter.value = true
}

// 选择分类
function selectCategory(id: number | undefined) {
  tempCategoryId.value = tempCategoryId.value === id ? undefined : id
}

// 切换积分兑换筛选
function togglePoints() {
  tempSupportPoints.value = tempSupportPoints.value ? undefined : true
}

// 重置筛选
function resetFilter() {
  tempCategoryId.value = undefined
  tempSupportPoints.value = undefined
}

// 确认筛选
function confirmFilter() {
  emit('update:categoryId', tempCategoryId.value)
  emit('update:supportPoints', tempSupportPoints.value)
  showFilter.value = false
}

// 选择排序
function selectSort(sort: SortOption) {
  emit('update:currentSort', sort)
  showSort.value = false
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

  <!-- 排序弹窗 -->
  <wd-popup v-model="showSort" position="bottom" round>
    <view class="sort-popup">
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
          <text>{{ sort.label }}</text>
          <wd-icon
            v-if="currentSort.label === sort.label"
            name="check"
            size="18px"
            color="#3b82f6"
          />
        </view>
      </view>
    </view>
  </wd-popup>

  <!-- 筛选弹窗 -->
  <wd-popup v-model="showFilter" position="bottom" round>
    <view class="filter-popup">
      <view class="popup-header">
        <text class="popup-title">筛选条件</text>
        <text class="popup-reset" @tap="resetFilter">重置</text>
      </view>

      <!-- 分类筛选 -->
      <view v-if="categories.length > 0" class="filter-section">
        <text class="section-title">商品分类</text>
        <view class="category-grid">
          <view
            v-for="cat in categories"
            :key="cat.id"
            class="category-item"
            :class="{ active: tempCategoryId === cat.id }"
            @tap="selectCategory(cat.id)"
          >
            <text>{{ cat.name }}</text>
          </view>
        </view>
      </view>

      <!-- 积分兑换筛选 -->
      <view class="filter-section">
        <text class="section-title">其他筛选</text>
        <view class="tag-list">
          <view
            class="filter-tag"
            :class="{ active: tempSupportPoints }"
            @tap="togglePoints"
          >
            <text>支持积分兑换</text>
          </view>
        </view>
      </view>

      <!-- 确认按钮 -->
      <view class="filter-footer">
        <button class="confirm-btn" @tap="confirmFilter">确定</button>
      </view>
    </view>
  </wd-popup>
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
  .popup-header {
    padding: 32rpx;
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
  }

  .sort-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 28rpx 32rpx;

    text {
      font-size: 30rpx;
      color: #374151;
    }

    &.active text {
      color: #3b82f6;
      font-weight: 500;
    }

    &:active {
      background: #f9fafb;
    }
  }
}

// 筛选弹窗
.filter-popup {
  max-height: 70vh;
  overflow-y: auto;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .popup-reset {
      font-size: 28rpx;
      color: #3b82f6;
    }
  }

  .filter-section {
    padding: 32rpx;

    .section-title {
      font-size: 28rpx;
      color: #6b7280;
      margin-bottom: 24rpx;
      display: block;
    }
  }

  .category-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .category-item {
    padding: 16rpx 32rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    border: 2rpx solid transparent;

    text {
      font-size: 28rpx;
      color: #374151;
    }

    &.active {
      background: #eff6ff;
      border-color: #3b82f6;

      text {
        color: #3b82f6;
      }
    }

    &:active {
      opacity: 0.8;
    }
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
  }

  .filter-tag {
    padding: 16rpx 32rpx;
    background: #f5f7fa;
    border-radius: 8rpx;
    border: 2rpx solid transparent;

    text {
      font-size: 28rpx;
      color: #374151;
    }

    &.active {
      background: #eff6ff;
      border-color: #3b82f6;

      text {
        color: #3b82f6;
      }
    }
  }

  .filter-footer {
    padding: 24rpx 32rpx;
    padding-bottom: calc(24rpx + env(safe-area-inset-bottom));

    .confirm-btn {
      width: 100%;
      height: 88rpx;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      border-radius: 44rpx;
      border: none;
      color: #fff;
      font-size: 32rpx;
      font-weight: 600;

      &:active {
        opacity: 0.9;
      }
    }
  }
}
</style>
