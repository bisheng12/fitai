<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UserForm from './components/UserForm.vue'
import FitnessPlan from './components/FitnessPlan.vue'
import CheckIn from './components/CheckIn.vue'
import HistoryList from './components/HistoryList.vue'
import ShareCard from './components/ShareCard.vue'
import type { UserProfile, FitnessPlan as FitnessPlanType } from './types'
import { aiService } from './services/aiService'
import { useCheckIn } from './composables/useCheckIn'
import { useHistory } from './composables/useHistory'

// 视图状态
type ViewType = 'form' | 'result' | 'history' | 'checkin'
const currentView = ref<ViewType>('form')

// 计划生成状态
const planStatus = ref<'idle' | 'generating' | 'success'>('idle')
const currentPlan = ref<FitnessPlanType | null>(null)
const currentProfile = ref<UserProfile | null>(null)

// 分享弹窗
const showShareCard = ref(false)

// Composables
const { isCheckedInToday, currentStreak, checkIn, stats: checkInStats } = useCheckIn()
const { savePlan, toggleFavorite, deleteRecord, allRecords } = useHistory()

// 加载状态
const isLoading = computed(() => planStatus.value === 'generating')

// 导航切换
const navigateTo = (view: ViewType) => {
  currentView.value = view
}

// 处理表单提交
const handleFormSubmit = async (profile: UserProfile) => {
  currentProfile.value = profile
  planStatus.value = 'generating'

  try {
    const result = await aiService.generateFitnessPlan(profile)

    if (result.success && result.data) {
      currentPlan.value = result.data
      planStatus.value = 'success'

      // 保存到历史记录
      savePlan(result.data, profile)

      // 切换到结果视图
      currentView.value = 'result'
    } else {
      alert('生成失败，请重试')
      planStatus.value = 'idle'
    }
  } catch (error) {
    alert('发生错误，请重试')
    planStatus.value = 'idle'
  }
}

// 返回编辑
const handleBack = () => {
  currentView.value = 'form'
  planStatus.value = 'idle'
  currentPlan.value = null
  currentProfile.value = null
}

// 重新生成
const handleRegenerate = () => {
  if (currentProfile.value) {
    handleFormSubmit(currentProfile.value)
  }
}

// 处理收藏
const handleToggleFavorite = (planId: string) => {
  toggleFavorite(planId)
}

// 处理删除
const handleDelete = (planId: string) => {
  deleteRecord(planId)
  if (currentPlan.value && planId === currentPlan.value.overview?.title) {
    handleBack()
  }
}

// 查看历史计划
const handleViewPlan = (record: any) => {
  currentProfile.value = record.profile
  currentPlan.value = record.plan
  planStatus.value = 'success'
  currentView.value = 'result'
}

// 签到处理
const handleCheckIn = () => {
  const result = checkIn()
  if (result.success) {
    // 签到成功动画已由组件内部处理
  }
}

// 打开分享
const handleShare = () => {
  showShareCard.value = true
}

// 关闭分享
const closeShare = () => {
  showShareCard.value = false
}

// 导航菜单
const navItems = [
  { id: 'form' as ViewType, label: '生成计划', icon: '🏋️' },
  { id: 'history' as ViewType, label: '我的计划', icon: '📋' },
  { id: 'checkin' as ViewType, label: '每日签到', icon: '✨' },
]
</script>

<template>
  <div class="min-h-screen bg-dark-900 text-white relative overflow-hidden">
    <!-- 粒子背景 -->
    <div class="fixed inset-0 pointer-events-none">
      <div class="absolute inset-0 bg-gradient-to-br from-dark-900 via-dark-850 to-dark-900"></div>
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-float"></div>
      <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl animate-float" style="animation-delay: -1.5s"></div>
    </div>

    <!-- 头部导航 -->
    <header class="relative z-10 bg-dark-850/80 backdrop-blur-lg border-b border-dark-500/50 sticky top-0">
      <div class="max-w-6xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-3 cursor-pointer" @click="navigateTo('form')">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xl animate-glow">
              💪
            </div>
            <div>
              <h1 class="text-xl font-bold gradient-text">FitAI</h1>
              <p class="text-xs text-dark-300">智能健身规划</p>
            </div>
          </div>

          <!-- 导航菜单 -->
          <nav class="flex items-center gap-2">
            <button
              v-for="item in navItems"
              :key="item.id"
              @click="navigateTo(item.id)"
              :class="[
                'px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2',
                currentView === item.id
                  ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
                  : 'text-dark-300 hover:text-white hover:bg-dark-700'
              ]"
            >
              <span>{{ item.icon }}</span>
              <span class="hidden sm:inline">{{ item.label }}</span>

              <!-- 签到红点 -->
              <span
                v-if="item.id === 'checkin' && !isCheckedInToday"
                class="w-2 h-2 bg-neon-pink rounded-full animate-pulse"
              ></span>
            </button>
          </nav>

          <!-- 签到状态 -->
          <div class="flex items-center gap-4">
            <div v-if="currentStreak > 0" class="flex items-center gap-2 px-3 py-1.5 bg-neon-purple/20 rounded-full border border-neon-purple/30">
              <span class="text-neon-purple">🔥</span>
              <span class="text-sm font-semibold text-neon-purple">{{ currentStreak }}天</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="relative z-10 max-w-6xl mx-auto px-4 py-8">
      <transition name="page" mode="out-in">

        <!-- 表单视图 -->
        <div v-if="currentView === 'form'" key="form" class="animate-slide-up">
          <UserForm @submit="handleFormSubmit" />
        </div>

        <!-- 结果视图 -->
        <div v-else-if="currentView === 'result'" key="result" class="animate-fade-in">
          <!-- 加载状态 -->
          <div v-if="isLoading" class="max-w-xl mx-auto p-8 bg-dark-800 rounded-2xl border border-dark-500 text-center">
            <div class="relative mb-6">
              <div class="w-24 h-24 border-4 border-dark-500 border-t-neon-blue rounded-full animate-spin mx-auto"></div>
              <span class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">🏋️</span>
            </div>

            <h2 class="text-2xl font-bold text-white mb-2">AI 正在生成健身计划...</h2>
            <p class="text-dark-300">根据你的情况量身定制中</p>

            <div class="mt-6 space-y-3">
              <div class="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <span class="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></span>
                <span class="text-dark-200">分析用户信息</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <span class="w-2 h-2 bg-neon-purple rounded-full animate-pulse" style="animation-delay: 0.3s"></span>
                <span class="text-dark-200">设计训练方案</span>
              </div>
              <div class="flex items-center gap-3 p-3 bg-dark-700 rounded-lg">
                <span class="w-2 h-2 bg-neon-pink rounded-full animate-pulse" style="animation-delay: 0.6s"></span>
                <span class="text-dark-200">搭配营养计划</span>
              </div>
            </div>
          </div>

          <!-- 成功状态 -->
          <FitnessPlan
            v-else-if="currentPlan && currentProfile"
            :plan="currentPlan"
            :profile="currentProfile"
            @regenerate="handleRegenerate"
            @back="handleBack"
            @share="handleShare"
          />
        </div>

        <!-- 历史记录视图 -->
        <div v-else-if="currentView === 'history'" key="history" class="animate-fade-in">
          <HistoryList
            @view="handleViewPlan"
            @favorite="handleToggleFavorite"
            @delete="handleDelete"
            @create-new="navigateTo('form')"
          />
        </div>

        <!-- 签到视图 -->
        <div v-else-if="currentView === 'checkin'" key="checkin" class="animate-fade-in">
          <CheckIn
            :is-checked-in="isCheckedInToday"
            :current-streak="currentStreak"
            :stats="checkInStats"
            @check-in="handleCheckIn"
          />
        </div>

      </transition>
    </main>

    <!-- 底部 -->
    <footer class="relative z-10 text-center py-6 text-dark-400 text-sm">
      <p>Powered by <span class="text-neon-blue">DeepSeek</span> AI • Built with ❤️</p>
    </footer>

    <!-- 分享弹窗 -->
    <transition name="fade">
      <div
        v-if="showShareCard"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        @click.self="closeShare"
      >
        <div class="animate-bounce-in">
          <ShareCard
            v-if="currentPlan"
            :plan="currentPlan"
            :profile="currentProfile"
            @close="closeShare"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>