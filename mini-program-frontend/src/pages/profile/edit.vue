<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/store/user'
import { useTokenStore } from '@/store/token'
import { updateUserProfile, uploadAvatar } from '@/api/user'

defineOptions({
  name: 'ProfileEdit',
})

definePage({
  style: {
    navigationBarTitleText: '编辑资料',
  },
})

const userStore = useUserStore()
const tokenStore = useTokenStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 加载状态
const loading = ref(false)

// 是否显示昵称编辑弹窗
const showNicknameEdit = ref(false)
const nicknameInput = ref('')

// 脱敏手机号
const maskedPhone = computed(() => {
  const phone = userInfo.value.phone || ''
  if (phone.length >= 11) {
    return `${phone.slice(0, 3)}****${phone.slice(-4)}`
  }
  return phone || '未绑定'
})

/**
 * 选择并上传头像
 */
async function handleChooseAvatar() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (!res.tempFilePaths || res.tempFilePaths.length === 0) {
      return
    }

    const tempFilePath = res.tempFilePaths[0]
    loading.value = true

    const result = await uploadAvatar(tempFilePath)

    if (result.avatar) {
      // 上传成功后，主动调用 getUserInfo 获取最新用户信息
      await userStore.fetchUserInfo()
      uni.showToast({ title: '保存成功', icon: 'success' })
    }
  } catch (error: any) {
    console.error('上传头像失败:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/**
 * 打开昵称编辑弹窗
 */
function openNicknameEdit() {
  nicknameInput.value = userInfo.value.nickname || ''
  showNicknameEdit.value = true
}

/**
 * 保存昵称
 */
async function handleSaveNickname() {
  if (!nicknameInput.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  if (nicknameInput.value === userInfo.value.nickname) {
    showNicknameEdit.value = false
    return
  }

  try {
    loading.value = true

    await updateUserProfile({ nickname: nicknameInput.value })

    userStore.setUserInfo({
      ...userInfo.value,
      nickname: nicknameInput.value,
    })

    showNicknameEdit.value = false
    uni.showToast({ title: '保存成功', icon: 'success' })
  } catch (error: any) {
    console.error('保存昵称失败:', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

/** 
 * 退出登录
 */
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
  <view class="profile-edit">
    <!-- 头像区域 -->
    <view class="avatar-section" @tap="handleChooseAvatar">
      <view class="avatar-wrapper">
        <image
          :key="userInfo.avatar"
          class="avatar"
          :class="{ 'avatar-loading': loading }"
          :src="userInfo.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <view v-if="loading" class="loading-mask">
          <wd-loading color="#fff" />
        </view>
        <view class="camera-icon">
          <wd-icon name="camera" size="28rpx" color="#3b82f6" />
        </view>
      </view>
      <view class="avatar-tip">点击更换头像</view>
    </view>

    <!-- 信息列表 -->
    <view class="info-list">
      <!-- 昵称 -->
      <view class="info-item" @tap="openNicknameEdit">
        <text class="item-label">昵称</text>
        <view class="item-right">
          <text class="item-value">{{ userInfo.nickname || '未设置' }}</text>
          <wd-icon name="arrow-right" size="32rpx" color="#999" />
        </view>
      </view>

      <!-- 手机号 -->
      <view class="info-item">
        <text class="item-label">手机号</text>
        <view class="item-right">
          <text class="item-value">{{ maskedPhone }}</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <text class="logout-btn" @tap="handleLogout">退出登录</text>
    </view>

    <!-- 昵称编辑弹窗 -->
    <wd-popup v-model="showNicknameEdit" position="bottom" round>
      <view class="nickname-popup">
        <view class="popup-header">
          <text class="popup-cancel" @tap="showNicknameEdit = false">取消</text>
          <text class="popup-title">修改昵称</text>
          <text class="popup-confirm" @tap="handleSaveNickname">保存</text>
        </view>
        <view class="popup-content">
          <input
            v-model="nicknameInput"
            class="nickname-input"
            type="text"
            placeholder="请输入昵称"
            maxlength="20"
            focus
          />
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style lang="scss" scoped>
.profile-edit {
  min-height: 100vh;
  background: #f5f7fa;
}

// 头像区域
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background: #fff;

  .avatar-wrapper {
    position: relative;
    width: 180rpx;
    height: 180rpx;

    .avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .avatar-loading {
      opacity: 0.6;
    }

    .loading-mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .camera-icon {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 48rpx;
      height: 48rpx;
      background: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
    }
  }

  .avatar-tip {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #3b82f6;
  }
}

// 信息列表
.info-list {
  margin-top: 20rpx;
  background: #fff;

  .info-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 36rpx 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }

    &:active {
      background: #f9f9f9;
    }

    .item-label {
      font-size: 30rpx;
      color: #333;
    }

    .item-right {
      display: flex;
      align-items: center;
      gap: 8rpx;

      .item-value {
        font-size: 30rpx;
        color: #666;
      }
    }
  }
}

// 退出登录
.logout-section {
  display: flex;
  justify-content: center;
  margin-top: 80rpx;
  padding-bottom: calc(60rpx + env(safe-area-inset-bottom));

  .logout-btn {
    font-size: 32rpx;
    color: #ef4444;

    &:active {
      opacity: 0.7;
    }
  }
}

// 昵称编辑弹窗
.nickname-popup {
  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .popup-cancel {
      font-size: 30rpx;
      color: #666;
    }

    .popup-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333;
    }

    .popup-confirm {
      font-size: 30rpx;
      color: #3b82f6;
    }
  }

  .popup-content {
    padding: 32rpx;

    .nickname-input {
      width: 100%;
      height: 88rpx;
      background: #f5f7fa;
      border-radius: 12rpx;
      padding: 0 24rpx;
      font-size: 30rpx;
      color: #333;
    }
  }
}
</style>
