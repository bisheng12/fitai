<script setup lang="ts">
import { computed, ref } from 'vue'
import { useHistory, type PlanRecord } from '../composables/useHistory'

const emit = defineEmits<{
  (e: 'view', record: PlanRecord): void
  (e: 'favorite', id: string): void
  (e: 'delete', id: string): void
  (e: 'create-new'): void
}>()

const { allRecords, favorites, stats, formatDate, toggleFavorite, deleteRecord } = useHistory()

// 当前标签
const activeTab = ref<'all' | 'favorites'>('all')

// 过滤后的记录
const filteredRecords = computed(() => {
  return activeTab.value === 'favorites' ? favorites.value : allRecords.value
})

// 删除确认
const deleteConfirmId = ref<string | null>(null)

const confirmDelete = (id: string) => {
  deleteConfirmId.value = id
}

const executeDelete = (id: string) => {
  emit('delete', id)
  deleteConfirmId.value = null
}

const cancelDelete = () => {
  deleteConfirmId.value = null
}

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
</script>

<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- 标题 -->
    <div class="text-center mb-8">
      <h2 class="text-3xl font-bold gradient-text mb-2">我的健身计划</h2>
      <p class="text-dark-300">共 {{ stats.total }} 个计划，{{ stats.favorites }} 个收藏</p>
    </div>

    <!-- 标签切换 -->
    <div class="flex gap-2 justify-center">
      <button
        @click="activeTab = 'all'"
        :class="[
          'px-6 py-2 rounded-full transition-all duration-300',
          activeTab === 'all'
            ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30'
            : 'bg-dark-700 text-dark-300 hover:text-white'
        ]"
      >
        📋 全部计划
      </button>
      <button
        @click="activeTab = 'favorites'"
        :class="[
          'px-6 py-2 rounded-full transition-all duration-300',
          activeTab === 'favorites'
            ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/30'
            : 'bg-dark-700 text-dark-300 hover:text-white'
        ]"
      >
        ❤️ 收藏计划
      </button>
    </div>

    <!-- 空状态 -->
    <div
      v-if="filteredRecords.length === 0"
      class="card-dark p-12 rounded-2xl text-center"
    >
      <div class="text-6xl mb-4">{{ activeTab === 'favorites' ? '💔' : '📝' }}</div>
      <h3 class="text-xl font-semibold mb-2">
        {{ activeTab === 'favorites' ? '暂无收藏' : '暂无计划' }}
      </h3>
      <p class="text-dark-400 mb-6">
        {{ activeTab === 'favorites' ? '去生成一个计划并收藏吧' : '开始创建你的第一个健身计划' }}
      </p>
      <button
        v-if="activeTab === 'all'"
        @click="emit('create-new')"
        class="btn-neon"
      >
        <span>✨ 开始生成</span>
      </button>
    </div>

    <!-- 计划列表 -->
    <div v-else class="space-y-4">
      <transition-group name="list">
        <div
          v-for="record in filteredRecords"
          :key="record.id"
          class="card-dark-glow p-5 rounded-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
          @click="emit('view', record)"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- 标题和目标 -->
              <div class="flex items-center gap-3 mb-2">
                <span class="text-2xl">{{ getGoalIcon(record.profile.goal) }}</span>
                <h3 class="text-lg font-semibold">{{ record.plan.overview?.title || '健身计划' }}</h3>
                <span class="px-2 py-0.5 bg-neon-blue/20 text-neon-blue text-xs rounded-full">
                  {{ getGoalText(record.profile.goal) }}
                </span>
              </div>

              <!-- 信息 -->
              <div class="flex items-center gap-4 text-sm text-dark-400 mb-3">
                <span>📅 {{ formatDate(record.createdAt) }}</span>
                <span>⏱️ {{ record.profile.planWeeks }}周计划</span>
                <span>🏋️ 每周{{ record.profile.daysPerWeek }}天</span>
              </div>

              <!-- 简介 -->
              <p class="text-dark-300 text-sm line-clamp-2">
                {{ record.plan.overview?.expectedResult || '个性化健身计划' }}
              </p>
            </div>

            <!-- 操作按钮 -->
            <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                @click.stop="emit('favorite', record.id)"
                :class="[
                  'p-2 rounded-lg transition-all duration-300',
                  record.isFavorite
                    ? 'text-neon-pink bg-neon-pink/20'
                    : 'text-dark-400 hover:text-neon-pink hover:bg-neon-pink/10'
                ]"
              >
                {{ record.isFavorite ? '❤️' : '🤍' }}
              </button>
              <button
                @click.stop="confirmDelete(record.id)"
                class="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
              >
                🗑️
              </button>
            </div>
          </div>

          <!-- 删除确认弹窗 -->
          <transition name="fade">
            <div
              v-if="deleteConfirmId === record.id"
              class="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              @click.stop
            >
              <p class="text-red-400 text-sm mb-2">确定要删除这个计划吗？</p>
              <div class="flex gap-2">
                <button
                  @click="executeDelete(record.id)"
                  class="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  删除
                </button>
                <button
                  @click="cancelDelete"
                  class="px-3 py-1 bg-dark-600 text-white rounded text-sm hover:bg-dark-500"
                >
                  取消
                </button>
              </div>
            </div>
          </transition>
        </div>
      </transition-group>
    </div>

    <!-- 创建新计划按钮 -->
    <div v-if="filteredRecords.length > 0" class="text-center pt-4">
      <button
        @click="emit('create-new')"
        class="btn-neon-outline"
      >
        <span class="flex items-center gap-2">
          <span>✨</span>
          <span>生成新计划</span>
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>