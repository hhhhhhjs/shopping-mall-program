<script lang="ts" setup>
import { reactive, ref } from 'vue'
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

// 表单数据
const formData = reactive({
  username: '',
  password: '',
})

// 密码是否可见
const showPassword = ref(false)
// 登录加载状态
const loading = ref(false)
// 同意协议
const agreePolicy = ref(false)

// 处理登录
async function handleLogin() {
  // 验证是否同意协议
  if (!agreePolicy.value) {
    uni.showToast({
      title: '请先阅读并同意用户协议',
      icon: 'none',
    })
    return
  }

  // 验证表单
  if (!formData.username.trim()) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!formData.password.trim()) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  try {
    loading.value = true
    await tokenStore.login({
      username: formData.username,
      password: formData.password,
    })
    // 登录成功后跳转到首页
    uni.switchTab({
      url: '/pages/index/index',
    })
  }
  catch (error) {
    console.error('登录失败:', error)
  }
  finally {
    loading.value = false
  }
}

// 切换密码显示状态
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

// 暂不登录，去首页
function goHome() {
  uni.switchTab({
    url: '/pages/index/index',
  })
}

// 返回上一页
function goBack() {
  uni.navigateBack({
    fail: () => {
      uni.switchTab({ url: '/pages/index/index' })
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

      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 用户名输入框 -->
        <view class="input-item">
          <view class="input-box">
            <wd-icon name="person" size="20px" color="#3b82f6" custom-class="input-prefix-icon" />
            <input
              v-model="formData.username"
              class="input-field"
              type="text"
              placeholder="请输入用户名"
              placeholder-class="input-placeholder"
            >
          </view>
        </view>

        <!-- 密码输入框 -->
        <view class="input-item">
          <view class="input-box">
            <wd-icon name="lock-on" size="20px" color="#3b82f6" custom-class="input-prefix-icon" />
            <input
              v-model="formData.password"
              class="input-field"
              :password="!showPassword"
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
            >
            <view class="password-toggle" @tap="togglePasswordVisibility">
              <wd-icon
                :name="showPassword ? 'view' : 'eye-close'"
                size="20px"
                color="#9ca3af"
              />
            </view>
          </view>
        </view>

        <!-- 登录按钮 -->
        <view class="login-btn-wrapper">
          <button
            class="login-btn"
            :class="{ 'is-loading': loading }"
            :disabled="loading"
            @tap="handleLogin"
          >
            <text v-if="!loading">登 录</text>
            <wd-loading v-else color="#fff" size="20px" />
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

        <!-- 暂不登录 -->
        <view class="skip-login" @tap="goHome">
          <text>暂不登录，去首页逛逛</text>
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
  margin-bottom: 80rpx;

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

// 表单区域
.form-section {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.input-item {
  .input-box {
    display: flex;
    align-items: center;
    background: #fff;
    border-radius: 48rpx;
    padding: 0 32rpx;
    height: 96rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    :deep(.input-prefix-icon) {
      margin-right: 20rpx;
    }

    .input-field {
      flex: 1;
      height: 100%;
      font-size: 30rpx;
      color: #1e293b;
    }

    .input-placeholder {
      color: #9ca3af;
      font-size: 30rpx;
    }

    .password-toggle {
      padding: 16rpx;
      margin-right: -16rpx;
    }
  }
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
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    letter-spacing: 4rpx;
    box-shadow: 0 8rpx 24rpx rgba(59, 130, 246, 0.4);
    transition: all 0.2s ease;

    &:active {
      transform: scale(0.98);
      opacity: 0.9;
    }

    &.is-loading {
      opacity: 0.8;
    }
  }
}

// 协议勾选
.agreement-section {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin-top: 16rpx;
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

// 暂不登录
.skip-login {
  text-align: center;
  margin-top: 40rpx;
  padding: 20rpx;

  text {
    font-size: 28rpx;
    color: #3b82f6;
  }
}
</style>
