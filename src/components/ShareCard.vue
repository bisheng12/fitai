<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FitnessPlan, UserProfile } from '../types'

const props = defineProps<{
  plan: FitnessPlan
  profile: UserProfile
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const cardRef = ref<HTMLElement | null>(null)
const isGenerating = ref(false)
const generatedImageUrl = ref<string | null>(null)

// 获取目标文字
const getGoalText = (goal: string) => {
  const goalMap: Record<string, string> = {
    'muscle': '增肌',
    'fat-loss': '减脂',
    'tone': '塑形',
    'fitness': '健身'
  }
  return goalMap[goal] || goal
}

// 获取目标图标
const getGoalIcon = (goal: string) => {
  const iconMap: Record<string, string> = {
    'muscle': '💪',
    'fat-loss': '🔥',
    'tone': '✨',
    'fitness': '🏃'
  }
  return iconMap[goal] || '📋'
}

// 生成分享图
const generateImage = async () => {
  if (!cardRef.value) return

  isGenerating.value = true

  try {
    // 动态导入 html2canvas
    const html2canvas = (await import('html2canvas')).default

    // 等待 DOM 更新
    await new Promise(resolve => setTimeout(resolve, 100))

    const canvas = await html2canvas(cardRef.value, {
      backgroundColor: '#0A0A0F',
      scale: 2,
      useCORS: true,
      logging: false
    })

    generatedImageUrl.value = canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Failed to generate image:', error)
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = () => {
  if (!generatedImageUrl.value) return

  const link = document.createElement('a')
  link.download = `FitAI-计划-${Date.now()}.png`
  link.href = generatedImageUrl.value
  link.click()
}

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!generatedImageUrl.value) return

  try {
    const response = await fetch(generatedImageUrl.value)
    const blob = await response.blob()
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob })
    ])
    alert('图片已复制到剪贴板')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

onMounted(() => {
  // 自动生成分享图
  setTimeout(generateImage, 300)
})
</script>

<template>
  <div class="relative">
    <!-- 关闭按钮 -->
    <button
      @click="emit('close')"
      class="absolute -top-4 -right-4 w-10 h-10 bg-dark-700 rounded-full flex items-center justify-center text-white hover:bg-dark-600 transition-colors z-20"
    >
      ✕
    </button>

    <div class="bg-dark-800 rounded-2xl p-6 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
        <span>📤</span>
        <span>分享健身计划</span>
      </h3>

      <!-- 分享卡片预览 -->
      <div ref="cardRef" class="bg-gradient-to-br from-dark-900 to-dark-800 rounded-xl p-6 border border-dark-500 mb-4">
        <!-- Logo -->
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xl">
            💪
          </div>
          <div>
            <div class="font-bold gradient-text">FitAI</div>
            <div class="text-xs text-dark-400">智能健身规划</div>
          </div>
        </div>

        <!-- 计划信息 -->
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-3xl">{{ getGoalIcon(profile.goal) }}</span>
            <div>
              <div class="font-bold text-lg">{{ plan.overview?.title || '健身计划' }}</div>
              <div class="text-sm text-dark-400">
                {{ getGoalText(profile.goal) }} · {{ plan.overview?.duration || profile.planWeeks + '周' }}
              </div>
            </div>
          </div>

          <div class="h-px bg-dark-500"></div>

          <!-- 用户信息 -->
          <div class="text-sm text-dark-300">
            <div>身高 {{ profile.height }}cm · 体重 {{ profile.weight }}kg</div>
            <div>每周 {{ profile.daysPerWeek }} 天 · 每次 {{ profile.durationPerSession }} 分钟</div>
          </div>

          <!-- 预期效果 -->
          <div class="p-3 bg-neon-blue/10 rounded-lg border border-neon-blue/20">
            <div class="text-xs text-neon-blue mb-1">预期效果</div>
            <div class="text-sm">{{ plan.overview?.expectedResult || '个性化健身计划' }}</div>
          </div>

          <!-- 营养目标 -->
          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-2 bg-dark-700 rounded-lg">
              <div class="text-neon-purple text-lg font-bold">{{ plan.overview?.targetCalories || 2000 }}</div>
              <div class="text-xs text-dark-400">千卡/天</div>
            </div>
            <div class="p-2 bg-dark-700 rounded-lg">
              <div class="text-neon-green text-lg font-bold">{{ plan.overview?.targetProtein || 120 }}g</div>
              <div class="text-xs text-dark-400">蛋白质</div>
            </div>
            <div class="p-2 bg-dark-700 rounded-lg">
              <div class="text-neon-pink text-lg font-bold">{{ profile.planWeeks }}周</div>
              <div class="text-xs text-dark-400">训练周期</div>
            </div>
          </div>

          <!-- 底部 -->
          <div class="text-center text-xs text-dark-400 pt-2">
            用 FitAI 生成你的专属计划 ✨
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="space-y-3">
        <!-- 生成中 -->
        <div v-if="isGenerating" class="text-center py-4">
          <div class="inline-flex items-center gap-2 text-neon-blue">
            <div class="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
            <span>正在生成图片...</span>
          </div>
        </div>

        <!-- 生成成功 -->
        <div v-else-if="generatedImageUrl" class="flex gap-2">
          <button
            @click="downloadImage"
            class="flex-1 btn-neon"
          >
            <span class="flex items-center justify-center gap-2">
              <span>⬇️</span>
              <span>下载图片</span>
            </span>
          </button>
          <button
            @click="copyToClipboard"
            class="px-4 py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-colors"
          >
            📋
          </button>
        </div>

        <!-- 重新生成 -->
        <button
          v-else
          @click="generateImage"
          class="w-full btn-neon-outline"
        >
          <span>🔄 重新生成图片</span>
        </button>
      </div>
    </div>
  </div>
</template>