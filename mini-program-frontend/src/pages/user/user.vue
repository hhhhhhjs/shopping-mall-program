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
        <!-- 用户信息卡片 -->
        <view class="user-info-card">
          <view class="card-content">
            <view class="user-info">
              <view class="avatar-wrapper">
                <view class="avatar-ring">
                  <image
                    class="avatar"
                    :src="userInfo.avatar || '/static/default-avatar.png'"
                    mode="aspectFill"
                  />
                </view>
              </view>
              <view class="info-content">
                <view class="nickname">
                  {{ userInfo.nickname || '用户' }}
                </view>
                <view class="user-level">
                  <text class="level-text">{{ userInfo.level || 1 }}级会员</text>
                </view>
              </view>
              <view class="arrow-right">
                <wd-icon name="arrow-right" size="20px" color="#9ca3af" />
              </view>
            </view>
          </view>
        </view>

        <!-- 积分统计卡片 -->
        <view class="stats-card">
          <view class="stats-row">
            <view class="stats-item">
              <view class="stats-value">
                {{ userInfo.points || 0 }}
              </view>
              <view class="stats-label">
                积分
              </view>
            </view>
            <view class="stats-divider" />
            <view class="stats-item">
              <view class="stats-value">
                {{ userInfo.orderCount || 0 }}
              </view>
              <view class="stats-label">
                订单
              </view>
            </view>
            <view class="stats-divider" />
            <view class="stats-item">
              <view class="stats-value">
                {{ userInfo.favoriteCount || 0 }}
              </view>
              <view class="stats-label">
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
  background: #fff;
  overflow: auto;
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
  // background: linear-gradient(180deg,
  //   rgba(219, 234, 254, 0.8) 0%,
  //   rgba(239, 246, 255, 0.6) 40%,
  //   rgba(255, 255, 255, 0) 100%
  // );

  background: linear-gradient(180deg, #dbeafe 0%, #eff6ff 50%, #ffffff 100%);
  // background: linear-gradient(180deg, #e0c3fc 0%, #8ec5fc 100%);
  border-radius: 0 0 20px 20px;
  padding-top: calc(env(safe-area-inset-top) + 40rpx);
  padding-bottom: 40rpx;

  .header-bg {
    display: none;
  }
}

.user-info-card {
  position: relative;
  margin: 0 32rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 24rpx rgba(59, 130, 246, 0.08);
  overflow: hidden;
  display: flex;

  .card-content {
    flex: 1;
    padding: 32rpx;
  }
}

.user-info {
  display: flex;
  align-items: center;

  .avatar-wrapper {
    margin-right: 24rpx;

    .avatar-ring {
      width: 110rpx;
      height: 110rpx;
      border-radius: 50%;

      padding: 5rpx;
      box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.25);

      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
  }

  .info-content {
    flex: 1;

    .nickname {
      font-size: 36rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10rpx;
    }

    .user-level {
      display: inline-flex;
      align-items: center;

      .level-text {
        font-size: 24rpx;
        color: #f59e0b;
        font-weight: 500;
      }
    }
  }

  .arrow-right {
    padding: 16rpx;
  }
}

.stats-card {
  margin: 24rpx 32rpx 0;
  background: #fff;
  border-radius: 24rpx;
  padding: 36rpx 0;
  box-shadow: 0 4rpx 24rpx rgba(59, 130, 246, 0.06);
}

.stats-row {
  display: flex;
  align-items: center;
  justify-content: space-around;

  .stats-item {
    text-align: center;
    flex: 1;

    .stats-value {
      font-size: 44rpx;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 10rpx;
    }

    .stats-label {
      font-size: 26rpx;
      color: #9ca3af;
    }
  }

  .stats-divider {
    width: 1rpx;
    height: 56rpx;
    background: #e5e7eb;
  }
}

.menu-section {
  padding: 0 32rpx;
  margin-top: 24rpx;
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
