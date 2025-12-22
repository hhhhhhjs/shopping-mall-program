<script lang="ts" setup>
import { computed } from 'vue'

import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/user'

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
        uni.reLaunch({ url: '/pages/login/login' })
      }
    },
  })
}
</script>

<template>
  <view class="user-page">
    <!-- 个人中心 -->
    <scroll-view
      scroll-y
      :show-scrollbar="false"
      class="user-scroll"
    >
      <!-- 顶部用户信息区域 -->
      <view class="header-section">
        <view class="header-bg" />
        <!-- 用户信息卡片 - 居中布局适配灵动岛 -->
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
                  <!-- 编辑按钮 -->
                  <view class="edit-btn">
                    <wd-icon name="edit-outline" size="28rpx" color="#fff" />
                  </view>
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
  </view>
</template>

<style lang="scss" scoped>
.user-page {
  height: 100vh;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-scroll {
  height: 100%;
  flex: 1;
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
  // 增加顶部边距适配灵动岛，iPhone 14 Pro 及之后机型灵动岛高度约 59pt
  padding-top: calc(env(safe-area-inset-top) + 80rpx);
  padding-bottom: 40rpx;

  .header-bg {
    display: none;
  }
}

.user-info-card {
  position: relative;
  margin: 0 32rpx;
  background: transparent;
  overflow: hidden;
  display: flex;

  .card-content {
    flex: 1;
    padding: 32rpx;
  }
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;

  .avatar-wrapper {
    margin-bottom: 24rpx;

    .avatar-ring {
      position: relative;
      width: 180rpx;
      height: 180rpx;
      border-radius: 50%;

      .avatar {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }

      .edit-btn {
        position: absolute;
        right: 0;
        bottom: 0;
        width: 56rpx;
        height: 56rpx;
        background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.4);
        border: 4rpx solid #fff;
      }
    }
  }

  .info-content {
    text-align: center;

    .nickname {
      font-size: 40rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16rpx;
    }

    .user-level {
      display: inline-flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      padding: 12rpx 28rpx;
      border-radius: 32rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);

      .level-text {
        font-size: 26rpx;
        color: #3b82f6;
        font-weight: 500;
      }
    }
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
