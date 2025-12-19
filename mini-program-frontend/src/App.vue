<script setup lang="ts">
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app'
import { navigateToInterceptor } from '@/router/interceptor'
import { useTokenStore } from '@/store/token'

onLaunch((options) => {
  console.log('App.vue onLaunch', options)

  // 入口登录检查：未登录则跳转到个人中心
  const tokenStore = useTokenStore()
  tokenStore.updateNowTime()

  if (!tokenStore.hasLogin) {
    console.log('[App] 未登录，跳转到个人中心')
    // 延迟执行，确保页面初始化完成
    setTimeout(() => {
      uni.switchTab({ url: '/pages/user/user' })
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
/* 重点 1: 去掉 scoped，必须是全局样式 */

/* 重点 2: 使用通配符 * 强制隐藏所有元素的滚动条 */
* {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE 10+ */
}

/* 重点 3: 针对 Webkit 内核 (Chrome/Safari/Edge/微信浏览器) */
::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  -webkit-appearance: none;
  background: transparent;
}

/* 重点 4: 专门针对 uni-app 的 page 标签 */
page {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

/* 额外保险: 如果有 scroll-view 组件 */
scroll-view ::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
</style>
