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

</style>
