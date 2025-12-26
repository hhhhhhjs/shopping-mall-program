<script lang="ts" setup>
/**
 * 商品卡片组件
 */
import type { GoodsItem } from '@/types/goods'
import { ref } from 'vue'

interface Props {
  /** 商品数据 */
  goods: GoodsItem
  /** 显示的价格（根据用户等级） */
  price: number
  /** 是否为瀑布流模式 */
  waterfall?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  waterfall: false,
})

const emit = defineEmits<{
  (e: 'click', goods: GoodsItem): void
  (e: 'imageLoad', height: number): void
}>()

// 图片高度
const imageHeight = ref(0)

function handleClick() {
  emit('click', props.goods)
}

function formatPrice(price: number): string {
  return price.toFixed(2)
}

// 图片加载完成
function handleImageLoad(e: any) {
  if (props.waterfall && e.detail) {
    const { height } = e.detail
    imageHeight.value = height
    emit('imageLoad', height)
  }
}
</script>

<template>
  <view class="goods-card" @tap="handleClick">
    <!-- 商品图片 -->
    <view class="goods-image-wrapper" :class="{ waterfall: waterfall }">
      <image
        class="goods-image"
        :src="goods.image"
        :mode="waterfall ? 'widthFix' : 'aspectFill'"
        lazy-load
        @load="handleImageLoad"
      />
      <!-- 积分兑换标签 -->
      <view v-if="goods.supportPoints" class="points-tag">
        <text>积分</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="goods-info">
      <!-- 商品名称 -->
      <view class="goods-name">
        {{ goods.name }}
      </view>

      <!-- 价格区域 -->
      <view class="goods-price-row">
        <view class="price-wrapper">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ formatPrice(price) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.goods-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}

.goods-image-wrapper {
  position: relative;
  width: 100%;

  &:not(.waterfall) {
    aspect-ratio: 1;
  }

  .goods-image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .points-tag {
    position: absolute;
    top: 12rpx;
    left: 12rpx;
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    padding: 6rpx 16rpx;
    border-radius: 8rpx;

    text {
      font-size: 22rpx;
      color: #fff;
      font-weight: 500;
    }
  }
}

.goods-info {
  padding: 20rpx 16rpx;
}

.goods-name {
  font-size: 28rpx;
  color: #1e293b;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 78rpx;
}

.goods-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16rpx;
}

.price-wrapper {
  display: flex;
  align-items: baseline;

  .price-symbol {
    font-size: 24rpx;
    color: #ef4444;
    font-weight: 600;
  }

  .price-value {
    font-size: 36rpx;
    color: #ef4444;
    font-weight: 700;
    margin-left: 2rpx;
  }
}

.stock-info {
  text {
    font-size: 22rpx;
    color: #9ca3af;
  }
}
</style>
