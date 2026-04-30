// ============================================
// FitAI - 签到功能 Composable
// ============================================

import { ref, computed } from 'vue'

export interface CheckInData {
  lastCheckIn: string | null  // ISO 日期字符串
  totalDays: number
  currentStreak: number
  longestStreak: number
  checkInDates: string[]  // 所有签到日期数组 ['2024-01-15', '2024-01-16', ...]
}

const STORAGE_KEY = 'fitai_checkin'

// 从 localStorage 加载数据
function loadCheckInData(): CheckInData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Failed to load check-in data:', e)
  }
  return {
    lastCheckIn: null,
    totalDays: 0,
    currentStreak: 0,
    longestStreak: 0,
    checkInDates: []
  }
}

// 保存数据到 localStorage
function saveCheckInData(data: CheckInData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save check-in data:', e)
  }
}

// 获取今天的日期字符串
function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// 获取指定日期的前一天
function getYesterdayString(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// 单例响应式数据
const checkInData = ref<CheckInData>(loadCheckInData())

export function useCheckIn() {
  // 检查今日是否已签到
  const isCheckedInToday = computed(() => {
    const today = getTodayString()
    return checkInData.value.checkInDates.includes(today)
  })

  // 获取连续签到天数
  const currentStreak = computed(() => {
    const dates = checkInData.value.checkInDates
    if (dates.length === 0) return 0

    // 按日期排序（最新的在前）
    const sortedDates = [...dates].sort().reverse()
    const today = getTodayString()
    const yesterday = getYesterdayString()

    // 如果今天和昨天都没签到，连续天数归零
    if (!dates.includes(today) && !dates.includes(yesterday)) {
      return 0
    }

    // 计算连续天数
    let streak = 0
    let checkDate = dates.includes(today) ? today : yesterday

    while (dates.includes(checkDate)) {
      streak++
      const prevDate = new Date(checkDate)
      prevDate.setDate(prevDate.getDate() - 1)
      checkDate = prevDate.toISOString().split('T')[0]
    }

    return streak
  })

  // 签到
  const checkIn = () => {
    if (isCheckedInToday.value) {
      return { success: false, message: '今日已签到' }
    }

    const today = getTodayString()
    const dates = [...checkInData.value.checkInDates]

    // 如果昨天已签到，连续天数继续
    const yesterday = getYesterdayString()
    let newStreak = 1
    if (checkInData.value.checkInDates.includes(yesterday)) {
      newStreak = checkInData.value.currentStreak + 1
    }

    // 更新数据
    const newData: CheckInData = {
      lastCheckIn: today,
      totalDays: checkInData.value.totalDays + 1,
      currentStreak: newStreak,
      longestStreak: Math.max(checkInData.value.longestStreak, newStreak),
      checkInDates: [...dates, today].sort()
    }

    checkInData.value = newData
    saveCheckInData(newData)

    return {
      success: true,
      message: '签到成功',
      streak: newStreak,
      badges: getNewBadges(newStreak)
    }
  }

  // 获取新获得的徽章
  const getNewBadges = (streak: number): string[] => {
    const badges: string[] = []
    if (streak >= 7) badges.push('7天徽章')
    if (streak >= 30) badges.push('30天徽章')
    if (streak >= 100) badges.push('百日徽章')
    return badges
  }

  // 获取用户拥有的所有徽章
  const badges = computed(() => {
    const streak = currentStreak.value
    return {
      '7天': streak >= 7,
      '30天': streak >= 30,
      '百日': streak >= 100
    }
  })

  // 获取某月签到统计
  const getMonthCheckIns = (year: number, month: number): string[] => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return checkInData.value.checkInDates.filter(date => date.startsWith(prefix))
  }

  // 获取签到统计
  const stats = computed(() => ({
    totalDays: checkInData.value.totalDays,
    currentStreak: currentStreak.value,
    longestStreak: checkInData.value.longestStreak
  }))

  return {
    isCheckedInToday,
    currentStreak,
    checkIn,
    badges,
    getMonthCheckIns,
    stats,
    checkInData
  }
}
