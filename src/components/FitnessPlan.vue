<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FitnessPlan, UserProfile } from '../types'
import { goalLabels, experienceLabels, calculateBMI, getBMICategory } from '../types'

const props = defineProps<{
  plan: FitnessPlan
  profile: UserProfile
}>()

const emit = defineEmits<{
  (e: 'regenerate'): void
  (e: 'back'): void
  (e: 'share'): void
}>()

// 当前选中的周
const selectedWeek = ref(0)

// 计算 BMI
const bmi = computed(() => calculateBMI(props.profile.weight, props.profile.height))
const bmiInfo = computed(() => getBMICategory(bmi.value))

// 当前周的训练计划
const currentWeek = computed(() => props.plan.weeks[selectedWeek.value])

// 切换周
const selectWeek = (index: number) => {
  selectedWeek.value = index
}

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  const map: Record<string, { bg: string; text: string }> = {
    '初级': { bg: 'bg-neon-green/20', text: 'text-neon-green' },
    '中级': { bg: 'bg-neon-orange/20', text: 'text-neon-orange' },
    '高级': { bg: 'bg-neon-pink/20', text: 'text-neon-pink' }
  }
  return map[difficulty] || { bg: 'bg-dark-600', text: 'text-dark-300' }
}

// 获取动作类别图标
const getCategoryIcon = (category: string) => {
  const map: Record<string, string> = {
    'compound': '💪',
    'isolation': '🎯',
    'cardio': '❤️',
    'core': '🔥',
    'stretch': '🧘',
    'plyometric': '⚡'
  }
  return map[category] || '🏃'
}

// 格式化时间
const formatDuration = (minutes: number) => {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}小时${m}分钟` : `${h}小时`
  }
  return `${minutes}分钟`
}
</script>

<template>
  <div class="space-y-8">
    <!-- 用户信息摘要 -->
    <div class="card-dark p-6 animate-fade-in">
      <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <span>📋</span>
        <span>你的健身档案</span>
      </h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="text-2xl font-bold text-white">{{ profile.age }}岁</div>
          <div class="text-sm text-dark-400">{{ profile.gender === 'male' ? '男' : '女' }}</div>
        </div>
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="text-2xl font-bold text-white">{{ profile.height }}cm</div>
          <div class="text-sm text-dark-400">身高</div>
        </div>
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="text-2xl font-bold text-white">{{ profile.weight }}kg</div>
          <div class="text-sm text-dark-400">体重</div>
        </div>
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="text-2xl font-bold" :class="bmiInfo.color === 'text-green-600' ? 'text-neon-green' : bmiInfo.color === 'text-yellow-600' ? 'text-neon-orange' : 'text-neon-pink'">{{ bmi }}</div>
          <div class="text-sm text-dark-400">BMI ({{ bmiInfo.category }})</div>
        </div>
        <div class="bg-neon-blue/10 rounded-xl p-4 border border-neon-blue/30">
          <div class="text-2xl font-bold text-neon-blue">{{ goalLabels[profile.goal] }}</div>
          <div class="text-sm text-neon-blue/70">健身目标</div>
        </div>
        <div class="bg-neon-purple/10 rounded-xl p-4 border border-neon-purple/30">
          <div class="text-2xl font-bold text-neon-purple">{{ experienceLabels[profile.experience] }}</div>
          <div class="text-sm text-neon-purple/70">经验水平</div>
        </div>
        <div class="bg-neon-pink/10 rounded-xl p-4 border border-neon-pink/30">
          <div class="text-2xl font-bold text-neon-pink">{{ profile.daysPerWeek }}天/周</div>
          <div class="text-sm text-neon-pink/70">训练频率</div>
        </div>
        <div class="bg-neon-green/10 rounded-xl p-4 border border-neon-green/30">
          <div class="text-2xl font-bold text-neon-green">{{ profile.planWeeks }}周</div>
          <div class="text-sm text-neon-green/70">计划周期</div>
        </div>
      </div>
    </div>

    <!-- 计划概览 -->
    <div class="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 rounded-2xl p-6 border border-neon-blue/30 animate-glow">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold gradient-text">{{ plan.overview.title }}</h2>
          <p class="text-dark-300 mt-1">{{ plan.overview.expectedResult }}</p>
        </div>
        <div class="flex flex-wrap gap-3">
          <span :class="['px-3 py-1 rounded-full text-sm font-medium', getDifficultyColor(plan.overview.difficulty).bg, getDifficultyColor(plan.overview.difficulty).text]">
            {{ plan.overview.difficulty }}
          </span>
          <span class="px-3 py-1 bg-neon-orange/20 text-neon-orange rounded-full text-sm border border-neon-orange/30">
            🔥 {{ plan.overview.targetCalories }} kcal/天
          </span>
          <span class="px-3 py-1 bg-neon-pink/20 text-neon-pink rounded-full text-sm border border-neon-pink/30">
            💪 {{ plan.overview.targetProtein }}g 蛋白质/天
          </span>
        </div>
      </div>
    </div>

    <!-- 周数切换 -->
    <div class="card-dark p-4 animate-fade-in">
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          v-for="(week, index) in plan.weeks"
          :key="index"
          @click="selectWeek(index)"
          :class="[
            'px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all',
            selectedWeek === index
              ? 'bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg'
              : 'bg-dark-700 text-dark-300 hover:bg-dark-600 border border-dark-500'
          ]"
        >
          第 {{ week.weekNumber }} 周
        </button>
      </div>

      <!-- 当前周主题 -->
      <div v-if="currentWeek" class="mt-4 p-4 bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 rounded-xl border border-neon-blue/20">
        <div class="flex items-center gap-2">
          <span class="text-2xl">🎯</span>
          <div>
            <div class="font-bold text-white">{{ currentWeek.theme }}</div>
            <div class="text-sm text-dark-300">{{ currentWeek.focus }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 每日训练 -->
    <div v-if="currentWeek" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="day in currentWeek.days"
        :key="day.dayNumber"
        :class="[
          'card-dark overflow-hidden transition-all duration-300 hover:scale-[1.02]',
          day.isRestDay ? 'opacity-75' : 'hover:shadow-neon-blue/20'
        ]"
      >
        <!-- 头部 -->
        <div :class="[
          'p-4',
          day.isRestDay ? 'bg-dark-700' : 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-b border-dark-500'
        ]">
          <div class="flex items-center justify-between">
            <div class="text-white">
              <div class="font-bold">{{ day.dayOfWeek }}</div>
              <div class="text-sm text-dark-300">{{ day.focus }}</div>
            </div>
            <div v-if="day.isRestDay" class="text-3xl">😴</div>
            <div v-else class="text-3xl">💪</div>
          </div>
          <div class="text-dark-300 text-sm mt-2">
            ⏱️ {{ formatDuration(day.duration) }}
          </div>
        </div>

        <!-- 内容 -->
        <div class="p-4">
          <template v-if="day.isRestDay">
            <p class="text-dark-400 text-center py-4">今日休息，让身体恢复</p>
            <p v-if="day.notes" class="text-sm text-dark-500 text-center">{{ day.notes }}</p>
          </template>

          <template v-else>
            <!-- 热身 -->
            <div class="mb-3">
              <div class="text-xs font-medium text-neon-orange mb-1">🔥 热身</div>
              <p class="text-sm text-dark-300">{{ day.warmup }}</p>
            </div>

            <!-- 动作列表 -->
            <div class="space-y-2">
              <div
                v-for="exercise in day.exercises"
                :key="exercise.id"
                class="bg-dark-700 rounded-lg p-3 border border-dark-500 hover:border-neon-blue/30 transition-all"
              >
                <div class="flex items-start gap-2">
                  <span class="text-lg">{{ getCategoryIcon(exercise.category) }}</span>
                  <div class="flex-1">
                    <div class="font-medium text-white">{{ exercise.name }}</div>
                    <div class="flex items-center gap-3 text-sm text-dark-400 mt-1">
                      <span class="text-neon-purple">{{ exercise.sets }}组</span>
                      <span>×</span>
                      <span>{{ exercise.reps }}</span>
                      <span class="text-dark-500">|</span>
                      <span>休息 {{ exercise.rest }}</span>
                    </div>
                    <p v-if="exercise.note" class="text-xs text-neon-blue mt-1">
                      💡 {{ exercise.note }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 放松 -->
            <div class="mt-3">
              <div class="text-xs font-medium text-neon-blue mb-1">🧘 放松</div>
              <p class="text-sm text-dark-300">{{ day.cooldown }}</p>
            </div>

            <!-- 备注 -->
            <p v-if="day.notes" class="text-xs text-dark-500 mt-3 italic">
              {{ day.notes }}
            </p>
          </template>
        </div>
      </div>
    </div>

    <!-- 饮食计划 -->
    <div class="card-dark p-6 animate-fade-in">
      <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <span class="text-2xl">🥗</span>
        <span>饮食计划</span>
      </h2>

      <!-- 饮食原则 -->
      <div class="bg-neon-blue/10 rounded-xl p-4 mb-6 border border-neon-blue/20">
        <div class="font-medium text-neon-blue mb-1">📌 饮食原则</div>
        <p class="text-dark-200">{{ plan.diet.principle }}</p>
      </div>

      <!-- 营养素目标 -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <div class="bg-neon-pink/10 rounded-xl p-4 text-center border border-neon-pink/20">
          <div class="text-2xl font-bold text-neon-pink">{{ plan.diet.macros.protein }}g</div>
          <div class="text-sm text-neon-pink/70">蛋白质</div>
        </div>
        <div class="bg-neon-orange/10 rounded-xl p-4 text-center border border-neon-orange/20">
          <div class="text-2xl font-bold text-neon-orange">{{ plan.diet.macros.carbs }}g</div>
          <div class="text-sm text-neon-orange/70">碳水</div>
        </div>
        <div class="bg-neon-purple/10 rounded-xl p-4 text-center border border-neon-purple/20">
          <div class="text-2xl font-bold text-neon-purple">{{ plan.diet.macros.fat }}g</div>
          <div class="text-sm text-neon-purple/70">脂肪</div>
        </div>
      </div>

      <!-- 餐次 -->
      <div class="space-y-4">
        <!-- 早餐 -->
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🌅</span>
              <div>
                <div class="font-bold text-white">{{ plan.diet.meals.breakfast.name }}</div>
                <div class="text-sm text-dark-400">{{ plan.diet.meals.breakfast.timeRange }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-neon-blue">{{ plan.diet.meals.breakfast.calories }} kcal</div>
              <div class="text-xs text-dark-400">P {{ plan.diet.meals.breakfast.protein }}g</div>
            </div>
          </div>
          <p class="text-dark-300 mb-2">{{ plan.diet.meals.breakfast.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="food in plan.diet.meals.breakfast.foods"
              :key="food.name"
              class="px-2 py-1 bg-dark-600 rounded text-sm text-dark-200 border border-dark-500"
            >
              {{ food.name }} {{ food.amount }}
            </span>
          </div>
        </div>

        <!-- 午餐 -->
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">☀️</span>
              <div>
                <div class="font-bold text-white">{{ plan.diet.meals.lunch.name }}</div>
                <div class="text-sm text-dark-400">{{ plan.diet.meals.lunch.timeRange }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-neon-purple">{{ plan.diet.meals.lunch.calories }} kcal</div>
              <div class="text-xs text-dark-400">P {{ plan.diet.meals.lunch.protein }}g</div>
            </div>
          </div>
          <p class="text-dark-300 mb-2">{{ plan.diet.meals.lunch.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="food in plan.diet.meals.lunch.foods"
              :key="food.name"
              class="px-2 py-1 bg-dark-600 rounded text-sm text-dark-200 border border-dark-500"
            >
              {{ food.name }} {{ food.amount }}
            </span>
          </div>
        </div>

        <!-- 晚餐 -->
        <div class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">🌙</span>
              <div>
                <div class="font-bold text-white">{{ plan.diet.meals.dinner.name }}</div>
                <div class="text-sm text-dark-400">{{ plan.diet.meals.dinner.timeRange }}</div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-neon-green">{{ plan.diet.meals.dinner.calories }} kcal</div>
              <div class="text-xs text-dark-400">P {{ plan.diet.meals.dinner.protein }}g</div>
            </div>
          </div>
          <p class="text-dark-300 mb-2">{{ plan.diet.meals.dinner.description }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="food in plan.diet.meals.dinner.foods"
              :key="food.name"
              class="px-2 py-1 bg-dark-600 rounded text-sm text-dark-200 border border-dark-500"
            >
              {{ food.name }} {{ food.amount }}
            </span>
          </div>
        </div>

        <!-- 加餐 -->
        <div v-if="plan.diet.meals.snacks && plan.diet.meals.snacks.length > 0"
          class="bg-dark-700 rounded-xl p-4 border border-dark-500">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-2xl">🍎</span>
            <div class="font-bold text-white">加餐</div>
          </div>
          <div class="space-y-3">
            <div
              v-for="(snack, index) in plan.diet.meals.snacks"
              :key="index"
              class="flex items-center justify-between"
            >
              <div>
                <span class="text-dark-300">{{ snack.name }}</span>
                <span class="text-sm text-dark-500 ml-2">{{ snack.timeRange }}</span>
              </div>
              <div class="text-right">
                <span class="font-medium text-neon-orange">{{ snack.calories }} kcal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 饮水和补剂 -->
      <div class="grid md:grid-cols-2 gap-4 mt-6">
        <div class="bg-neon-blue/10 rounded-xl p-4 border border-neon-blue/20">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">💧</span>
            <div class="font-bold text-neon-blue">饮水建议</div>
          </div>
          <p class="text-dark-200">{{ plan.diet.waterIntake }}</p>
        </div>

        <div v-if="plan.diet.supplements && plan.diet.supplements.length > 0" class="bg-neon-green/10 rounded-xl p-4 border border-neon-green/20">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-2xl">💊</span>
            <div class="font-bold text-neon-green">补剂建议</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="supp in plan.diet.supplements"
              :key="supp"
              class="px-2 py-1 bg-neon-green/20 rounded text-neon-green text-sm border border-neon-green/30"
            >
              {{ supp }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 训练技巧 -->
    <div class="card-dark p-6 animate-fade-in">
      <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span class="text-2xl">💡</span>
        <span>训练技巧</span>
      </h2>
      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="(tip, index) in plan.tips"
          :key="index"
          class="flex items-start gap-3 p-3 bg-dark-700 rounded-lg border border-dark-500"
        >
          <span class="w-6 h-6 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{{ index + 1 }}</span>
          <p class="text-dark-200">{{ tip }}</p>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="flex justify-center gap-4 flex-wrap">
      <button
        @click="$emit('back')"
        class="px-6 py-3 bg-dark-700 text-white rounded-xl hover:bg-dark-600 transition-all border border-dark-500"
      >
        ← 修改信息
      </button>
      <button
        @click="$emit('share')"
        class="px-6 py-3 bg-neon-pink/20 text-neon-pink rounded-xl hover:bg-neon-pink/30 transition-all border border-neon-pink/30"
      >
        📤 分享计划
      </button>
      <button
        @click="$emit('regenerate')"
        class="btn-neon"
      >
        <span>🔄 重新生成</span>
      </button>
    </div>
  </div>
</template>