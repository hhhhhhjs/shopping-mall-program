<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import { useTokenStore } from '@/store/token'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)

  // 入口登录检查：未登录则跳转到登录页面
  const tokenStore = useTokenStore()
  tokenStore.updateNowTime()

  if (!tokenStore.hasLogin) {
    // 延迟执行，确保页面初始化完成
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 100)
  }
})
onShow((options) => {
  console.log('App.vue onShow', options)
  // 处理直接进入页面路由的情况：如h5直接输入路由、微信小程序分享后进入等
  // https://github.com/unibest-tech/unibest/issues/192
  if (options?.path) {
    navigateToInterceptor.invoke({ url: `/${options.path}`, query: options.query })
  }
  else {
    navigateToInterceptor.invoke({ url: '/' })
  }
})
onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">

::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background: transparent;
}

/* 确保scroll-view组件也隐藏滚动条 */
scroll-view::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background: transparent;
}

/* 为页面添加隐藏滚动条样式 */
.comment-list::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
  background: transparent;
}
</style>
