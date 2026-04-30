<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCheckIn } from '../composables/useCheckIn'

const props = defineProps<{
  isCheckedIn: boolean
  currentStreak: number
  stats: {
    totalDays: number
    currentStreak: number
    longestStreak: number
  }
}>()

const emit = defineEmits<{
  (e: 'check-in'): void
}>()

const { getMonthCheckIns } = useCheckIn()

// 当前查看的月份
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

// 月份名称
const monthNames = [
  '一月', '二月', '三月', '四月', '五月', '六月',
  '七月', '八月', '九月', '十月', '十一月', '十二月'
]

// 获取当月的天数
const daysInMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

// 获取当月第一天是星期几
const firstDayOfMonth = computed(() => {
  return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

// 当月的签到日期
const checkInDates = computed(() => {
  return getMonthCheckIns(currentYear.value, currentMonth.value)
})

// 判断某天是否签到
const isDayCheckedIn = (day: number): boolean => {
  const dateStr = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return checkInDates.value.includes(dateStr)
}

// 判断某天是否是今天
const isToday = (day: number): boolean => {
  const today = new Date()
  return (
    today.getFullYear() === currentYear.value &&
    today.getMonth() === currentMonth.value &&
    today.getDate() === day
  )
}

// 签到成功动画
const showSuccessAnimation = ref(false)

// 徽章列表
const badgeList = [
  { id: '7天', name: '7天连续', icon: '🌟', requirement: 7, color: 'from-yellow-500 to-orange-500' },
  { id: '30天', name: '30天连续', icon: '🔥', requirement: 30, color: 'from-red-500 to-pink-500' },
  { id: '百日', name: '百日大师', icon: '👑', requirement: 100, color: 'from-purple-500 to-indigo-500' },
]

// 徽章是否解锁
const isBadgeUnlocked = (requirement: number) => {
  return props.currentStreak >= requirement
}

// 上一个月
const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

// 下一个月
const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// 处理签到
const handleCheckIn = () => {
  emit('check-in')
  showSuccessAnimation.value = true
  setTimeout(() => {
    showSuccessAnimation.value = false
  }, 2000)
}

// 周几标签
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- 标题 -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold gradient-text mb-2">每日签到</h2>
      <p class="text-dark-300">坚持签到，解锁成就徽章</p>
    </div>

    <!-- 签到卡片 -->
    <div class="card-dark-glow p-6 rounded-2xl text-center relative overflow-hidden">
      <!-- 背景装饰 -->
      <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div class="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 rounded-full blur-2xl"></div>
        <div class="absolute bottom-0 left-0 w-24 h-24 bg-neon-purple/10 rounded-full blur-2xl"></div>
      </div>

      <div class="relative z-10">
        <!-- 连续签到天数 -->
        <div class="mb-6">
          <div class="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-full border border-neon-blue/30">
            <span class="text-3xl animate-float">🔥</span>
            <div class="text-left">
              <div class="text-3xl font-bold text-neon-blue">{{ currentStreak }}</div>
              <div class="text-xs text-dark-300">连续签到天数</div>
            </div>
          </div>
        </div>

        <!-- 签到按钮 -->
        <button
          v-if="!isCheckedIn"
          @click="handleCheckIn"
          class="btn-neon text-lg px-8 py-4"
        >
          <span>✨ 今日签到</span>
        </button>

        <div v-else class="inline-flex items-center gap-2 px-6 py-3 bg-neon-green/20 rounded-full border border-neon-green/30">
          <span class="text-xl">✅</span>
          <span class="text-neon-green font-semibold">今日已签到</span>
        </div>

        <!-- 签到成功动画 -->
        <transition name="bounce">
          <div
            v-if="showSuccessAnimation"
            class="absolute inset-0 flex items-center justify-center bg-dark-800/90 rounded-2xl"
          >
            <div class="text-center animate-bounce-in">
              <span class="text-6xl mb-4 block">🎉</span>
              <div class="text-2xl font-bold text-neon-green">签到成功!</div>
            </div>
          </div>
        </transition>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-3 gap-4">
      <div class="card-dark p-4 rounded-xl text-center">
        <div class="text-2xl mb-1">{{ stats.totalDays }}</div>
        <div class="text-xs text-dark-400">累计签到</div>
      </div>
      <div class="card-dark p-4 rounded-xl text-center">
        <div class="text-2xl mb-1 text-neon-purple">{{ currentStreak }}</div>
        <div class="text-xs text-dark-400">当前连续</div>
      </div>
      <div class="card-dark p-4 rounded-xl text-center">
        <div class="text-2xl mb-1 text-neon-pink">{{ stats.longestStreak }}</div>
        <div class="text-xs text-dark-400">最长连续</div>
      </div>
    </div>

    <!-- 月历 -->
    <div class="card-dark p-6 rounded-2xl">
      <!-- 月份切换 -->
      <div class="flex items-center justify-between mb-6">
        <button
          @click="prevMonth"
          class="p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 class="text-lg font-semibold">
          {{ currentYear }}年 {{ monthNames[currentMonth] }}
        </h3>
        <button
          @click="nextMonth"
          class="p-2 rounded-lg hover:bg-dark-700 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- 周标题 -->
      <div class="grid grid-cols-7 gap-2 mb-2">
        <div
          v-for="day in weekDays"
          :key="day"
          class="text-center text-sm text-dark-400 py-2"
        >
          {{ day }}
        </div>
      </div>

      <!-- 日期格子 -->
      <div class="grid grid-cols-7 gap-2">
        <!-- 空白格子 -->
        <div
          v-for="i in firstDayOfMonth"
          :key="'empty-' + i"
          class="aspect-square"
        ></div>

        <!-- 日期格子 -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          :class="[
            'aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all duration-300',
            isDayCheckedIn(day)
              ? 'bg-gradient-to-br from-neon-blue to-neon-purple text-white shadow-neon-blue'
              : isToday(day)
                ? 'bg-dark-600 text-neon-blue border border-neon-blue/50'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
          ]"
        >
          <span class="relative">
            {{ day }}
            <span
              v-if="isDayCheckedIn(day)"
              class="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full"
            ></span>
          </span>
        </div>
      </div>
    </div>

    <!-- 徽章墙 -->
    <div class="card-dark p-6 rounded-2xl">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>🏆</span>
        <span>成就徽章</span>
      </h3>

      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="badge in badgeList"
          :key="badge.id"
          :class="[
            'p-4 rounded-xl text-center transition-all duration-500',
            isBadgeUnlocked(badge.requirement)
              ? 'bg-gradient-to-br ' + badge.color + ' opacity-100'
              : 'bg-dark-700 opacity-40'
          ]"
        >
          <div class="text-3xl mb-2">{{ badge.icon }}</div>
          <div class="font-semibold text-sm">{{ badge.name }}</div>
          <div class="text-xs opacity-70">{{ badge.requirement }}天</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s ease-out;
}

.bounce-leave-active {
  animation: bounce-in 0.3s ease-in reverse;
}

@keyframes bounce-in {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>