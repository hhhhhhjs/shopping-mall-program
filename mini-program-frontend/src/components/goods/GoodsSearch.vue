<script lang="ts" setup>
/**
 * 商品搜索栏组件
 */
import { ref, watch } from 'vue'
import { debounce } from '@/utils/debounce'

interface Props {
  /** 搜索关键词 */
  modelValue?: string
  /** 占位文字 */
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '搜索商品',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', value: string): void
  (e: 'clear'): void
}>()

const keyword = ref(props.modelValue)

// 监听外部值变化
watch(() => props.modelValue, (val) => {
  keyword.value = val
})

// 防抖搜索
const debouncedSearch = debounce((value: string) => {
  emit('search', value)
}, 300)

function handleInput(e: any) {
  const value = e.detail.value
  keyword.value = value
  emit('update:modelValue', value)
  debouncedSearch(value)
}

function handleClear() {
  keyword.value = ''
  emit('update:modelValue', '')
  emit('clear')
}

function handleSearch() {
  emit('search', keyword.value)
}
</script>

<template>
  <view class="search-bar">
    <view class="search-input-wrapper">
      <wd-icon name="search" size="18px" color="#9ca3af" />
      <input
        class="search-input"
        type="text"
        :value="keyword"
        :placeholder="placeholder"
        placeholder-class="placeholder"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleSearch"
      />
      <view v-if="keyword" class="clear-btn" @tap="handleClear">
        <wd-icon name="close-fill" size="16px" color="#9ca3af" />
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.search-bar {
  padding: 16rpx 24rpx;
  background: #fff;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  height: 72rpx;
  background: #f5f7fa;
  border-radius: 36rpx;
  padding: 0 24rpx;
  gap: 16rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: #1e293b;
}

.placeholder {
  color: #9ca3af;
}

.clear-btn {
  padding: 8rpx;

  &:active {
    opacity: 0.7;
  }
}
</style>
