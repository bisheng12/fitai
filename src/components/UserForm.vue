<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { UserProfile, FitnessGoal, FitnessPreference, ExperienceLevel } from '../types'
import { goalLabels, preferenceLabels, experienceLabels, calculateBMI, getBMICategory } from '../types'

// 定义 emit
const emit = defineEmits<{
  (e: 'submit', profile: UserProfile): void
  (e: 'update:loading', loading: boolean): void
}>()

// 表单数据
const form = reactive<UserProfile>({
  age: 25,
  gender: 'male',
  height: 170,
  weight: 65,
  goal: 'muscle',
  preferences: [],
  experience: 'beginner',
  daysPerWeek: 4,
  durationPerSession: 60,
  planWeeks: 2
})

// 可选的偏好列表
const preferenceOptions: FitnessPreference[] = [
  'home', 'gym', 'no-equipment', 'dumbbells', 'barbell', 'treadmill', 'resistance-bands', 'pull-up-bar'
]

// 目标选项
const goalOptions: FitnessGoal[] = ['muscle', 'fat-loss', 'tone', 'fitness']

// 经验选项
const experienceOptions: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced']

// 目标图标
const goalIcons: Record<string, string> = {
  'muscle': '💪',
  'fat-loss': '🔥',
  'tone': '✨',
  'fitness': '🏃'
}

// 经验图标
const experienceIcons: Record<string, string> = {
  'beginner': '🌱',
  'intermediate': '🌿',
  'advanced': '🌳'
}

// 切换偏好
const togglePreference = (pref: FitnessPreference) => {
  const index = form.preferences.indexOf(pref)
  if (index === -1) {
    form.preferences.push(pref)
  } else {
    form.preferences.splice(index, 1)
  }
}

// 计算 BMI
const bmi = computed(() => calculateBMI(form.weight, form.height))
const bmiInfo = computed(() => getBMICategory(bmi.value))

// 验证表单
const isValid = computed(() => {
  return (
    form.age >= 16 && form.age <= 70 &&
    form.height >= 100 && form.height <= 250 &&
    form.weight >= 30 && form.weight <= 200 &&
    form.preferences.length > 0
  )
})

// 提交表单
const handleSubmit = () => {
  if (!isValid.value) return
  emit('submit', { ...form })
}
</script>

<template>
  <div class="max-w-2xl mx-auto p-6 card-dark-glow animate-fade-in">
    <!-- 标题 -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold gradient-text mb-2">🏋️ FitAI 智能健身规划</h1>
      <p class="text-dark-300">告诉我们你的情况，AI 将为你量身定制健身计划</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- 基本信息 -->
      <section>
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-neon-blue/20 text-neon-blue rounded-full flex items-center justify-center text-sm font-bold border border-neon-blue/30">1</span>
          基本信息
        </h2>

        <div class="grid grid-cols-2 gap-4">
          <!-- 年龄 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-1">年龄</label>
            <input
              v-model.number="form.age"
              type="number"
              min="16"
              max="70"
              class="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all"
            />
            <span class="text-xs text-dark-400">16-70岁</span>
          </div>

          <!-- 性别 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-1">性别</label>
            <div class="flex gap-4 mt-1">
              <label class="flex items-center gap-2 cursor-pointer text-dark-200 hover:text-neon-blue transition-colors">
                <input
                  type="radio"
                  v-model="form.gender"
                  value="male"
                  class="w-4 h-4 text-neon-blue focus:ring-neon-blue"
                />
                <span>男</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-dark-200 hover:text-neon-pink transition-colors">
                <input
                  type="radio"
                  v-model="form.gender"
                  value="female"
                  class="w-4 h-4 text-neon-pink focus:ring-neon-pink"
                />
                <span>女</span>
              </label>
            </div>
          </div>

          <!-- 身高 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-1">身高 (cm)</label>
            <input
              v-model.number="form.height"
              type="number"
              min="100"
              max="250"
              class="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all"
            />
          </div>

          <!-- 体重 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-1">体重 (kg)</label>
            <input
              v-model.number="form.weight"
              type="number"
              min="30"
              max="200"
              class="w-full px-4 py-2 bg-dark-700 border border-dark-500 rounded-lg focus:ring-2 focus:ring-neon-blue focus:border-neon-blue transition-all"
            />
          </div>
        </div>

        <!-- BMI 显示 -->
        <div class="mt-4 p-4 bg-dark-700 rounded-lg border border-dark-500">
          <div class="flex items-center justify-between">
            <span class="text-dark-300">你的 BMI:</span>
            <div class="text-right">
              <span class="text-2xl font-bold" :class="bmiInfo.color === 'text-green-600' ? 'text-neon-green' : bmiInfo.color === 'text-yellow-600' ? 'text-neon-orange' : 'text-neon-pink'">{{ bmi }}</span>
              <span class="ml-2 text-sm" :class="bmiInfo.color === 'text-green-600' ? 'text-neon-green' : bmiInfo.color === 'text-yellow-600' ? 'text-neon-orange' : 'text-neon-pink'">({{ bmiInfo.category }})</span>
            </div>
          </div>
          <p class="text-sm text-dark-400 mt-1">{{ bmiInfo.description }}</p>
        </div>
      </section>

      <!-- 健身目标 -->
      <section>
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-neon-purple/20 text-neon-purple rounded-full flex items-center justify-center text-sm font-bold border border-neon-purple/30">2</span>
          健身目标
        </h2>

        <div class="grid grid-cols-2 gap-3">
          <button
            v-for="goal in goalOptions"
            :key="goal"
            type="button"
            @click="form.goal = goal"
            :class="[
              'p-4 rounded-xl border-2 transition-all text-left hover-glow',
              form.goal === goal
                ? 'border-neon-blue bg-neon-blue/10 text-neon-blue shadow-neon-blue'
                : 'border-dark-500 bg-dark-700 hover:border-dark-400 text-dark-200'
            ]"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xl">{{ goalIcons[goal] }}</span>
              <span class="font-medium">{{ goalLabels[goal] }}</span>
            </div>
            <div class="text-xs text-dark-400">
              {{ goal === 'muscle' ? '增加肌肉量，练出好身材' : '' }}
              {{ goal === 'fat-loss' ? '减少体脂，塑造线条' : '' }}
              {{ goal === 'tone' ? '紧致身材，提升气质' : '' }}
              {{ goal === 'fitness' ? '提升整体体能和健康' : '' }}
            </div>
          </button>
        </div>
      </section>

      <!-- 可用设备和偏好 -->
      <section>
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-neon-pink/20 text-neon-pink rounded-full flex items-center justify-center text-sm font-bold border border-neon-pink/30">3</span>
          可用设备和训练环境
        </h2>

        <p class="text-sm text-dark-400 mb-3">可多选，AI 会根据你的情况安排动作</p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="pref in preferenceOptions"
            :key="pref"
            type="button"
            @click="togglePreference(pref)"
            :class="[
              'px-4 py-2 rounded-full border-2 transition-all text-sm hover-glow',
              form.preferences.includes(pref)
                ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                : 'border-dark-500 bg-dark-700 text-dark-300 hover:border-dark-400'
            ]"
          >
            {{ preferenceLabels[pref] }}
          </button>
        </div>
      </section>

      <!-- 运动经验 -->
      <section>
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-neon-green/20 text-neon-green rounded-full flex items-center justify-center text-sm font-bold border border-neon-green/30">4</span>
          运动经验
        </h2>

        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="exp in experienceOptions"
            :key="exp"
            type="button"
            @click="form.experience = exp"
            :class="[
              'p-4 rounded-xl border-2 transition-all text-center hover-glow',
              form.experience === exp
                ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-neon-green'
                : 'border-dark-500 bg-dark-700 hover:border-dark-400'
            ]"
          >
            <div class="text-2xl mb-1">{{ experienceIcons[exp] }}</div>
            <div class="font-medium text-sm">{{ experienceLabels[exp] }}</div>
          </button>
        </div>
      </section>

      <!-- 时间安排 -->
      <section>
        <h2 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span class="w-8 h-8 bg-neon-orange/20 text-neon-orange rounded-full flex items-center justify-center text-sm font-bold border border-neon-orange/30">5</span>
          时间安排
        </h2>

        <div class="space-y-4">
          <!-- 每周训练天数 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-2">
              每周训练天数: <span class="text-neon-blue font-bold">{{ form.daysPerWeek }} 天</span>
            </label>
            <input
              v-model.number="form.daysPerWeek"
              type="range"
              min="1"
              max="7"
              step="1"
              class="w-full h-2 bg-dark-600 rounded-lg appearance-none cursor-pointer accent-neon-blue"
            />
            <div class="flex justify-between text-xs text-dark-400 mt-1">
              <span>1天</span>
              <span>7天</span>
            </div>
          </div>

          <!-- 每次时长 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-2">
              每次训练时长: <span class="text-neon-purple font-bold">{{ form.durationPerSession }} 分钟</span>
            </label>
            <div class="grid grid-cols-4 gap-2">
              <button
                v-for="duration in [30, 45, 60, 90]"
                :key="duration"
                type="button"
                @click="form.durationPerSession = duration"
                :class="[
                  'py-2 rounded-lg border-2 transition-all text-sm hover-glow',
                  form.durationPerSession === duration
                    ? 'border-neon-purple bg-neon-purple/20 text-neon-purple'
                    : 'border-dark-500 bg-dark-700 text-dark-300 hover:border-dark-400'
                ]"
              >
                {{ duration }}分钟
              </button>
            </div>
          </div>

          <!-- 计划周期 -->
          <div>
            <label class="block text-sm font-medium text-dark-200 mb-2">
              计划周期: <span class="text-neon-pink font-bold">{{ form.planWeeks }} 周</span>
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="weeks in [2, 4, 6]"
                :key="weeks"
                type="button"
                @click="form.planWeeks = weeks"
                :class="[
                  'py-2 rounded-lg border-2 transition-all text-sm hover-glow',
                  form.planWeeks === weeks
                    ? 'border-neon-pink bg-neon-pink/20 text-neon-pink'
                    : 'border-dark-500 bg-dark-700 text-dark-300 hover:border-dark-400'
                ]"
              >
                {{ weeks }}周
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 提交按钮 -->
      <button
        type="submit"
        :disabled="!isValid"
        :class="[
          'w-full py-4 rounded-xl font-semibold text-lg transition-all',
          isValid
            ? 'btn-neon'
            : 'bg-dark-700 text-dark-400 cursor-not-allowed border-2 border-dark-500'
        ]"
      >
        <span>{{ isValid ? '🚀 开始生成健身计划' : '请选择设备偏好' }}</span>
      </button>
    </form>
  </div>
</template>