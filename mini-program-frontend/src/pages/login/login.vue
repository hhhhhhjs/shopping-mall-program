<script lang="ts" setup>
import { ref } from 'vue'
import { useTokenStore } from '@/store/token'

defineOptions({
  name: 'Login',
})

definePage({
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
})

const tokenStore = useTokenStore()

// 登录加载状态
const loading = ref(false)
// 同意协议
const agreePolicy = ref(false)

/**
 * 处理手机号授权回调
 * 微信基础库 2.21.2+ 版本返回 code，旧版本返回 encryptedData 和 iv
 */
async function handleGetPhoneNumber(e: any) {
  console.log('手机号授权回调:', e)

  // 用户拒绝授权
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    console.log('用户拒绝授权手机号')
    uni.showToast({
      title: '需要授权手机号才能登录',
      icon: 'none',
    })
    return
  }

  // 获取手机号授权返回的 code（新版API）
  const phoneCode = e.detail.code
  if (!phoneCode) {
    uni.showToast({
      title: '获取手机号失败，请重试',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true
    await tokenStore.phoneLogin(phoneCode)
    // 登录成功后跳转到商品页
    uni.switchTab({
      url: '/pages/goods/list',
    })
  }
  catch (error) {
    console.error('登录失败:', error)
  }
  finally {
    loading.value = false
  }
}

// 返回上一页
function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/goods/list' })
    },
  })
}
</script>

<template>
  <view class="login-page">
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="nav-back" @tap="goBack">
        <wd-icon name="arrow-left" size="22px" color="#333" />
      </view>
    </view>

    <!-- 主内容区域 -->
    <view class="login-content">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <view class="logo-card">
          <image
            class="logo-image"
            src="/static/images/image.png"
            mode="aspectFit"
            @error="(e) => console.log('图片加载失败:', e)"
            @load="() => console.log('图片加载成功')"
          />
        </view>
      </view>

      <!-- 标题区域 -->
      <view class="title-section">
        <text class="title">欢迎登录</text>
      </view>

      <!-- 登录按钮区域 -->
      <view class="form-section">
        <!-- 手机号一键登录按钮 -->
        <view class="login-btn-wrapper">
          <button
            class="login-btn phone-login-btn"
            :class="{ 'is-loading': loading, 'is-disabled': !agreePolicy }"
            :disabled="loading || !agreePolicy"
            open-type="getPhoneNumber"
            @getphonenumber="handleGetPhoneNumber"
          >
            <wd-icon v-if="!loading" name="phone" size="20px" color="#fff" custom-class="btn-icon" />
            <wd-loading v-if="loading" color="#fff" size="20px" />
            <text v-else>手机号一键登录</text>
          </button>
        </view>

        <!-- 协议勾选 -->
        <view class="agreement-section">
          <view class="agreement-check" @tap="agreePolicy = !agreePolicy">
            <view class="check-icon" :class="{ checked: agreePolicy }">
              <wd-icon v-if="agreePolicy" name="check" size="12px" color="#fff" />
            </view>
          </view>
          <view class="agreement-text">
            <text class="text-gray">我已阅读并同意</text>
            <text class="text-link">《用户服务协议》</text>
            <text class="text-gray">及</text>
            <text class="text-link">《隐私政策》</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #e8f4fc 0%, #d4e8f7 30%, #f5f9fc 100%);
  position: relative;
}

// 顶部导航
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  padding-top: env(safe-area-inset-top);
  height: calc(88rpx + env(safe-area-inset-top));
  display: flex;
  align-items: center;
  padding-left: 24rpx;

  .nav-back {
    width: 72rpx;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
  }
}

.login-content {
  padding: 0 48rpx;
  padding-top: calc(180rpx + env(safe-area-inset-top));
}

// Logo 区域
.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 48rpx;

  .logo-card {
    width: 180rpx;
    height: 180rpx;
    background: #fff;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 40rpx rgba(59, 130, 246, 0.15);

    .logo-image {
      width: 140rpx;
      height: 140rpx;
    }
  }
}

// 标题区域
.title-section {
  text-align: center;
  margin-bottom: 64rpx;

  .title {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16rpx;
  }

  .subtitle {
    display: block;
    font-size: 28rpx;
    color: #64748b;
  }
}

// 表单区域
.form-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

// 登录按钮
.login-btn-wrapper {
  margin-top: 24rpx;

  .login-btn {
    width: 100%;
    height: 96rpx;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    border-radius: 48rpx;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    letter-spacing: 2rpx;
    box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;

    &.is-loading {
      opacity: 0.8;
    }

    &.is-disabled {
      opacity: 0.5;
      background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
      box-shadow: none;
    }

    :deep(.btn-icon) {
      margin-right: 8rpx;
    }
  }

  .phone-login-btn {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.4);
  }
}

// 登录提示
.login-tips {
  text-align: center;
  margin-top: -8rpx;

  text {
    font-size: 24rpx;
    color: #9ca3af;
  }
}

// 协议勾选
.agreement-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 32rpx;
  gap: 12rpx;

  .agreement-check {
    padding-top: 4rpx;

    .check-icon {
      width: 32rpx;
      height: 32rpx;
      border-radius: 50%;
      border: 2rpx solid #d1d5db;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &.checked {
        background: #3b82f6;
        border-color: #3b82f6;
      }
    }
  }

  .agreement-text {
    font-size: 26rpx;
    line-height: 1.6;

    .text-gray {
      color: #6b7280;
    }

    .text-link {
      color: #3b82f6;
    }
  }
}
</style>
