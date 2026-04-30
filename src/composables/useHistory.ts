// ============================================
// FitAI - 历史记录 Composable
// ============================================

import { ref, computed } from 'vue'
import type { FitnessPlan, UserProfile } from '../types'

export interface PlanRecord {
  id: string
  createdAt: string  // ISO 日期字符串
  plan: FitnessPlan
  profile: UserProfile
  isFavorite: boolean
}

const STORAGE_KEY = 'fitai_history'

// 从 localStorage 加载数据
function loadHistory(): PlanRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load history:', e)
  }
  return []
}

// 保存数据到 localStorage
function saveHistory(data: PlanRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save history:', e)
  }
}

// 生成唯一 ID
function generateId(): string {
  return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 单例响应式数据
const history = ref<PlanRecord[]>(loadHistory())

export function useHistory() {
  // 获取所有历史记录（按时间倒序）
  const allRecords = computed(() => {
    return [...history.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // 获取收藏的计划
  const favorites = computed(() => {
    return allRecords.value.filter(r => r.isFavorite)
  })

  // 获取最近的计划
  const recent = computed(() => {
    return allRecords.value.slice(0, 5)
  })

  // 保存新计划
  const savePlan = (plan: FitnessPlan, profile: UserProfile): string => {
    const record: PlanRecord = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      plan,
      profile,
      isFavorite: false
    }

    history.value = [record, ...history.value]

    // 限制最多保存 50 条记录
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }

    saveHistory(history.value)
    return record.id
  }

  // 切换收藏状态
  const toggleFavorite = (id: string): boolean => {
    const index = history.value.findIndex(r => r.id === id)
    if (index !== -1) {
      history.value[index].isFavorite = !history.value[index].isFavorite
      saveHistory(history.value)
      return history.value[index].isFavorite
    }
    return false
  }

  // 删除记录
  const deleteRecord = (id: string): void => {
    history.value = history.value.filter(r => r.id !== id)
    saveHistory(history.value)
  }

  // 获取指定记录
  const getRecord = (id: string): PlanRecord | undefined => {
    return history.value.find(r => r.id === id)
  }

  // 清除所有记录
  const clearHistory = (): void => {
    history.value = []
    saveHistory([])
  }

  // 格式化日期
  const formatDate = (isoString: string): string => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days} 天前`
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  // 统计信息
  const stats = computed(() => ({
    total: history.value.length,
    favorites: favorites.value.length
  }))

  return {
    allRecords,
    favorites,
    recent,
    savePlan,
    toggleFavorite,
    deleteRecord,
    getRecord,
    clearHistory,
    formatDate,
    stats
  }
}
