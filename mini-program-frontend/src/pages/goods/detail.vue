<script lang="ts" setup>
/**
 * 商品详情页
 */
import { ref, computed, onMounted } from 'vue'
import { useGoodsDetail } from '@/hooks/useGoods'
import type { GoodsItem } from '@/types/goods'

defineOptions({
  name: 'GoodsDetail',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '商品详情',
  },
})

// 获取系统信息，计算状态栏高度
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = computed(() => systemInfo.statusBarHeight || 44)

const { goods, loading, getGoodsPrice, formatPrice, toggleFavorite } = useGoodsDetail()

// 当前轮播索引
const currentIndex = ref(0)

// 获取路由参数
const goodsId = ref<number>(0)

// 轮播图列表
const swiperImages = computed(() => {
  if (!goods.value) return []
  return goods.value.images?.length ? goods.value.images : [goods.value.image]
})

// 模拟数据
const mockGoods: GoodsItem = {
  id: 1,
  name: 'A4打印纸 70g 500张/包 高品质办公用纸 不卡纸',
  image: 'https://img.yzcdn.cn/vant/cat.jpeg',
  images: [
    'https://img.yzcdn.cn/vant/cat.jpeg',
    'https://img.yzcdn.cn/vant/cat.jpeg',
    'https://img.yzcdn.cn/vant/cat.jpeg',
  ],
  description: '高品质A4打印纸，70g加厚设计，不易卡纸，打印清晰，适用于各类打印机、复印机。每包500张，经济实惠。',
  spec: '70g / 500张/包',
  categoryId: 1,
  categoryName: '办公用品',
  stock: 1000,
  showStock: true,
  price1: 28.00,
  price2: 26.00,
  price3: 24.00,
  price4: 22.00,
  supportPoints: true,
  pointsPrice: 280,
  isFavorite: false,
}

onMounted(() => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage?.options || {}
  goodsId.value = Number(options.id) || 0

  // 模拟加载数据
  goods.value = mockGoods
})

// 轮播切换
function handleSwiperChange(e: any) {
  currentIndex.value = e.detail.current
}

// 返回上一页
function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/goods/list' })
    },
  })
}

// 收藏/取消收藏
function handleFavorite() {
  toggleFavorite()
  uni.showToast({
    title: goods.value?.isFavorite ? '已收藏' : '已取消收藏',
    icon: 'none',
  })
}

// 加入购物车
function handleAddToCart() {
  uni.showToast({
    title: '已加入购物车',
    icon: 'success',
  })
  // TODO: 调用 API 添加到购物车
}

// 立即购买
function handleBuyNow() {
  // TODO: 跳转到订单确认页
  uni.showToast({
    title: '立即购买',
    icon: 'none',
  })
}
</script>

<template>
  <view class="goods-detail-page">
    <!-- 自定义导航栏 -->
    <view class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px', height: (44 + statusBarHeight) + 'px' }">
      <view class="nav-back" @tap="goBack">
        <wd-icon name="arrow-left" size="22px" color="#333" />
      </view>
      <text class="nav-title">商品详情</text>
      <view class="nav-placeholder" />
    </view>

    <!-- 内容区域 -->
    <scroll-view
      class="content-scroll"
      scroll-y
      enhanced
      :show-scrollbar="false"
    >
      <view v-if="goods" class="content-wrapper">
        <!-- 商品图片轮播 -->
        <view class="swiper-section">
          <swiper
            class="goods-swiper"
            :current="currentIndex"
            circular
            autoplay
            :interval="4000"
            @change="handleSwiperChange"
          >
            <swiper-item v-for="(img, index) in swiperImages" :key="index">
              <image class="swiper-image" :src="img" mode="aspectFill" />
            </swiper-item>
          </swiper>

          <!-- 轮播指示器 -->
          <view class="swiper-indicator">
            <text>{{ currentIndex + 1 }} / {{ swiperImages.length }}</text>
          </view>

          <!-- 积分标签 -->
          <view v-if="goods.supportPoints" class="points-badge">
            <wd-icon name="gift" size="14px" color="#fff" />
            <text>支持积分兑换</text>
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="goods-info-section">
          <!-- 价格区域 -->
          <view class="price-row">
            <view class="price-main">
              <text class="price-symbol">¥</text>
              <text class="price-value">{{ formatPrice(getGoodsPrice()) }}</text>
            </view>
            <view v-if="goods.supportPoints" class="points-price">
              <text>或 {{ goods.pointsPrice }} 积分</text>
            </view>
          </view>

          <!-- 商品名称 -->
          <view class="goods-name">
            {{ goods.name }}
          </view>

          <!-- 规格信息 -->
          <view v-if="goods.spec" class="goods-spec">
            <text class="spec-label">规格</text>
            <text class="spec-value">{{ goods.spec }}</text>
          </view>

          <!-- 库存信息 -->
          <view v-if="goods.showStock" class="goods-stock">
            <text class="stock-label">库存</text>
            <text class="stock-value">{{ goods.stock }} 件</text>
          </view>
        </view>

        <!-- 商品详情 -->
        <view class="detail-section">
          <view class="section-header">
            <text class="section-title">商品详情</text>
          </view>
          <view class="detail-content">
            <text>{{ goods.description }}</text>
          </view>
        </view>

        <!-- 底部占位 -->
        <view class="bottom-placeholder" />
      </view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-left">
        <!-- 收藏按钮 -->
        <view class="action-icon-btn" @tap="handleFavorite">
          <wd-icon
            :name="goods?.isFavorite ? 'star-on' : 'star'"
            size="24px"
            :color="goods?.isFavorite ? '#f59e0b' : '#666'"
          />
          <text :class="{ active: goods?.isFavorite }">收藏</text>
        </view>

        <!-- 购物车按钮 -->
        <view class="action-icon-btn" @tap="() => uni.switchTab({ url: '/pages/cart/index' })">
          <wd-icon name="cart" size="24px" color="#666" />
          <text>购物车</text>
        </view>
      </view>

      <view class="action-right">
        <button class="btn-cart" @tap="handleAddToCart">加入购物车</button>
        <button class="btn-buy" @tap="handleBuyNow">立即购买</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.goods-detail-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f7fa;
}

// 导航栏
.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
  // paddingTop 和 height 通过动态样式设置
  background: #fff;
  box-sizing: border-box;

  .nav-back {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #f5f7fa;

    &:active {
      background: #e5e7eb;
    }
  }

  .nav-title {
    font-size: 34rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .nav-placeholder {
    width: 72rpx;
  }
}

// 内容滚动区
.content-scroll {
  flex: 1;
  overflow: hidden;

  &::-webkit-scrollbar {
    display: none;
  }
}

.content-wrapper {
  padding-bottom: 20rpx;
}

// 轮播图
.swiper-section {
  position: relative;
  background: #fff;
}

.goods-swiper {
  width: 100%;
  height: 750rpx;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.swiper-indicator {
  position: absolute;
  right: 24rpx;
  bottom: 24rpx;
  background: rgba(0, 0, 0, 0.5);
  padding: 8rpx 20rpx;
  border-radius: 20rpx;

  text {
    font-size: 24rpx;
    color: #fff;
  }
}

.points-badge {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  padding: 12rpx 20rpx;
  border-radius: 8rpx;

  text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;
  }
}

// 商品信息
.goods-info-section {
  background: #fff;
  padding: 32rpx;
  margin-top: 20rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 20rpx;

  .price-main {
    display: flex;
    align-items: baseline;

    .price-symbol {
      font-size: 32rpx;
      color: #ef4444;
      font-weight: 600;
    }

    .price-value {
      font-size: 56rpx;
      color: #ef4444;
      font-weight: 700;
      margin-left: 4rpx;
    }
  }

  .points-price {
    text {
      font-size: 26rpx;
      color: #f59e0b;
    }
  }
}

.goods-name {
  margin-top: 24rpx;
  font-size: 34rpx;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.5;
}

.goods-spec,
.goods-stock {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;

  .spec-label,
  .stock-label {
    font-size: 28rpx;
    color: #6b7280;
    width: 80rpx;
  }

  .spec-value,
  .stock-value {
    font-size: 28rpx;
    color: #1e293b;
  }
}

.goods-stock {
  border-top: none;
  padding-top: 0;
}

// 商品详情
.detail-section {
  background: #fff;
  margin-top: 20rpx;
  padding: 32rpx;

  .section-header {
    margin-bottom: 24rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .detail-content {
    text {
      font-size: 28rpx;
      color: #374151;
      line-height: 1.8;
    }
  }
}

.bottom-placeholder {
  height: calc(140rpx + env(safe-area-inset-bottom));
}

// 底部操作栏
.action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.action-left {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding-right: 32rpx;
  border-right: 1rpx solid #f0f0f0;

  .action-icon-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rpx;

    text {
      font-size: 22rpx;
      color: #666;

      &.active {
        color: #f59e0b;
      }
    }

    &:active {
      opacity: 0.7;
    }
  }
}

.action-right {
  flex: 1;
  display: flex;
  gap: 16rpx;
  padding-left: 24rpx;

  button {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    border: none;
    font-size: 28rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .btn-cart {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
    color: #fff;
  }

  .btn-buy {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
  }
}
</style>
