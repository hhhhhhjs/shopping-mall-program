<script lang="ts" setup>
import { computed, watch } from 'vue'

import Login from '@/components/login.vue'

import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'
import { tabbarStore } from '@/tabbar/store'

defineOptions({
  name: 'User',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '个人中心',
  },
})

const tokenStore = useTokenStore()
const userStore = useUserStore()

// 是否已登录
const isLoggedIn = computed(() => tokenStore.hasLogin)

// 未登录时隐藏 tabbar
watch(isLoggedIn, (val) => {
  tabbarStore.setVisible(val)
}, { immediate: true })

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// ========== 个人中心相关 ==========
const menuList = [
  { icon: 'order', title: '我的订单', path: '/pages/order/list' },
  { icon: 'star-on', title: '我的收藏', path: '/pages/favorite/list' },
  { icon: 'coupon', title: '积分兑换', path: '/pages/points/index' },
  { icon: 'location', title: '收货地址', path: '/pages/address/list' },
]

function goToPage(path: string) {
  uni.navigateTo({ url: path })
}

async function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: async (res) => {
      if (res.confirm) {
        await tokenStore.logout()
        uni.showToast({ title: '已退出登录', icon: 'none' })
      }
    },
  })
}
</script>

<template>
  <view class="user-page">
    <!-- ========== 已登录：个人中心 ========== -->
    <scroll-view v-if="isLoggedIn" scroll-y class="user-scroll-container">
      <!-- 顶部用户信息区域 -->
      <view class="header-section">
        <view class="header-bg" />
        <view class="user-info-card">
          <view class="user-info">
            <view class="avatar-wrapper">
              <image
                class="avatar"
                :src="userInfo.avatar || '/static/default-avatar.png'"
                mode="aspectFill"
              />
            </view>
            <view class="info-content">
              <view class="nickname">
                {{ userInfo.nickname || '用户' }}
              </view>
              <view class="user-level">
                <wd-icon name="vip" size="14px" color="#f59e0b" />
                <text class="level-text">{{ userInfo.level || 1 }}级会员</text>
              </view>
            </view>
            <view class="arrow-right">
              <wd-icon name="arrow-right" size="18px" color="#9ca3af" />
            </view>
          </view>

          <!-- 积分信息 -->
          <view class="points-row">
            <view class="points-item">
              <view class="points-value">
                {{ userInfo.points || 0 }}
              </view>
              <view class="points-label">
                积分
              </view>
            </view>
            <view class="divider" />
            <view class="points-item">
              <view class="points-value">
                {{ userInfo.orderCount || 0 }}
              </view>
              <view class="points-label">
                订单
              </view>
            </view>
            <view class="divider" />
            <view class="points-item">
              <view class="points-value">
                {{ userInfo.favoriteCount || 0 }}
              </view>
              <view class="points-label">
                收藏
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 功能菜单 -->
      <view class="menu-section">
        <view class="menu-card">
          <view
            v-for="(item, index) in menuList"
            :key="index"
            class="menu-item"
            @tap="goToPage(item.path)"
          >
            <view class="menu-left">
              <wd-icon :name="item.icon" size="22px" color="#3b82f6" />
              <text class="menu-title">{{ item.title }}</text>
            </view>
            <wd-icon name="arrow-right" size="16px" color="#d1d5db" />
          </view>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-section">
        <button class="logout-btn" @tap="handleLogout">
          退出登录
        </button>
      </view>
    </scroll-view>

    <!-- ========== 未登录：显示登录组件 ========== -->
    <Login v-else class="login-wrapper" />
  </view>
</template>

<style lang="scss" scoped>
.user-page {
  height: 100vh;
  background: #f5f7fa;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-scroll-container {
  flex: 1;
  height: 0;
}

.login-wrapper {
  flex: 1;
  overflow: hidden;
}

// ========== 个人中心样式 ==========
.header-section {
  position: relative;
  padding-bottom: 60rpx;

  .header-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 320rpx;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 0 0 40rpx 40rpx;
  }
}

.user-info-card {
  position: relative;
  margin: 0 32rpx;
  margin-top: calc(120rpx + env(safe-area-inset-top));
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
}

.user-info {
  display: flex;
  align-items: center;

  .avatar-wrapper {
    margin-right: 28rpx;

    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      border: 4rpx solid #fff;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
    }
  }

  .info-content {
    flex: 1;

    .nickname {
      font-size: 36rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8rpx;
    }

    .user-level {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .level-text {
        font-size: 24rpx;
        color: #f59e0b;
      }
    }
  }

  .arrow-right {
    padding: 16rpx;
  }
}

.points-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 40rpx;
  padding-top: 40rpx;
  border-top: 1rpx solid #f1f5f9;

  .points-item {
    text-align: center;
    flex: 1;

    .points-value {
      font-size: 40rpx;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8rpx;
    }

    .points-label {
      font-size: 24rpx;
      color: #9ca3af;
    }
  }

  .divider {
    width: 1rpx;
    height: 60rpx;
    background: #e5e7eb;
  }
}

.menu-section {
  padding: 0 32rpx;
  margin-top: 32rpx;
}

.menu-card {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f7fa;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f9fafb;
  }

  .menu-left {
    display: flex;
    align-items: center;
    gap: 24rpx;

    .menu-title {
      font-size: 30rpx;
      color: #374151;
    }
  }
}

.logout-section {
  padding: 60rpx 32rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));

  .logout-btn {
    width: 100%;
    height: 88rpx;
    background: #fff;
    border: 2rpx solid #ef4444;
    border-radius: 44rpx;
    color: #ef4444;
    font-size: 30rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      background: #fef2f2;
    }
  }
}
</style>
