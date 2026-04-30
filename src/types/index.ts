// ============================================
// FitAI - 用户和健身计划类型定义
// 这是整个项目的"数据蓝图"
// ============================================

// 用户健身档案
export interface UserProfile {
  // 基本信息
  age: number              // 年龄 (16-70)
  gender: 'male' | 'female' // 性别
  height: number            // 身高 (cm)
  weight: number            // 体重 (kg)

  // 健身目标
  goal: FitnessGoal

  // 可用设备和偏好
  preferences: FitnessPreference[]

  // 运动经验
  experience: ExperienceLevel

  // 时间安排
  daysPerWeek: number       // 每周训练天数 (1-7)
  durationPerSession: number // 每次训练时长 (分钟)
  planWeeks: number         // 计划周期 (4/8/12周)
}

// 健身目标枚举
export type FitnessGoal =
  | 'muscle'      // 增肌
  | 'fat-loss'    // 减脂
  | 'tone'        // 塑形
  | 'fitness'     // 提升体能

// 健身偏好/设备
export type FitnessPreference =
  | 'home'              // 居家训练
  | 'gym'               // 健身房
  | 'no-equipment'      // 无器械
  | 'dumbbells'         // 有哑铃
  | 'barbell'           // 有杠铃
  | 'treadmill'         // 有跑步机
  | 'resistance-bands'  // 弹力带
  | 'pull-up-bar'       // 单杠

// 经验水平
export type ExperienceLevel =
  | 'beginner'       // 零基础
  | 'intermediate'   // 有一定基础
  | 'advanced'       // 经验丰富

// ============================================
// AI 生成的健身计划
// ============================================

export interface FitnessPlan {
  overview: PlanOverview      // 计划概述
  weeks: WeekPlan[]           // 每周计划
  diet: DietPlan               // 饮食计划
  tips: string[]               // 训练技巧
}

// 计划概述
export interface PlanOverview {
  title: string                // 计划标题
  duration: string            // 计划时长
  difficulty: string           // 难度等级
  expectedResult: string       // 预期效果
  targetCalories: number       // 目标每日热量
  targetProtein: number        // 目标每日蛋白质 (g)
}

// 每周训练计划
export interface WeekPlan {
  weekNumber: number           // 第几周
  theme: string                // 本周主题 (如 "基础力量建立")
  focus: string                // 训练重点
  days: DailyWorkout[]         // 每天训练
}

// 单日训练计划
export interface DailyWorkout {
  dayOfWeek: string             // 星期几 (如 "周一")
  dayNumber: number             // 第几天 (如 1, 2, 3...)
  isRestDay: boolean            // 是否是休息日
  focus: string                // 今日训练重点
  duration: number             // 预计时长 (分钟)
  warmup: string               // 热身动作
  exercises: Exercise[]         // 训练动作
  cooldown: string             // 放松动作
  notes?: string               // 额外说明
}

// 单个训练动作
export interface Exercise {
  id: string                   // 动作ID
  name: string                 // 动作名称
  category: ExerciseCategory   // 动作类别
  sets: number                 // 组数
  reps: string                 // 次数/时长 (如 "8-12次" 或 "30秒")
  rest: string                 // 组间休息 (如 "60秒")
  tempo?: string               // 动作节奏 (如 "2-1-2")
  note?: string                // 动作要点/提示
  alternatives?: string[]      // 替代动作
}

// 动作类别
export type ExerciseCategory =
  | 'compound'    // 复合动作 (深蹲、硬拉等)
  | 'isolation'   // 孤立动作 (二头弯举等)
  | 'cardio'      // 有氧运动
  | 'core'        // 核心训练
  | 'stretch'     // 拉伸
  | 'plyometric'  // 爆发力训练

// ============================================
// 饮食计划
// ============================================

export interface DietPlan {
  principle: string            // 饮食原则
  dailyCalories: number         // 每日热量目标
  macros: MacroTargets          // 三大营养素目标
  meals: MealSchedule           // 餐次安排
  waterIntake: string           // 饮水建议
  supplements?: string[]        // 补剂建议
  warnings?: string[]           // 饮食禁忌
}

// 营养素目标
export interface MacroTargets {
  protein: number               // 蛋白质 (g)
  carbs: number                 // 碳水 (g)
  fat: number                  // 脂肪 (g)
}

// 每日餐次安排
export interface MealSchedule {
  breakfast: Meal              // 早餐
  lunch: Meal                  // 午餐
  dinner: Meal                 // 晚餐
  snacks?: Meal[]              // 加餐 (可选)
}

// 单餐建议
export interface Meal {
  name: string                  // 餐名
  timeRange: string             // 建议时间 (如 "7:00-8:00")
  description: string           // 食物描述
  foods: FoodItem[]            // 具体食物列表
  calories: number             // 热量
  protein: number              // 蛋白质 (g)
  carbs: number                // 碳水 (g)
  fat: number                  // 脂肪 (g)
}

// 食物项目
export interface FoodItem {
  name: string                 // 食物名称
  amount: string              // 分量 (如 "100g", "1个")
  calories?: number            // 热量 (可选)
}

// ============================================
// 本地存储相关类型
// ============================================

export interface SavedPlan {
  id: string                   // 唯一ID
  createdAt: string            // 创建时间 (ISO格式)
  userProfile: UserProfile     // 用户输入信息
  fitnessPlan: FitnessPlan     // 生成的健身计划
  isFavorite: boolean          // 是否收藏
  title: string                // 自定义标题
}

// ============================================
// UI 状态相关类型
// ============================================

// 生成计划的状态
export type PlanGenerationStatus =
  | 'idle'           // 空闲
  | 'generating'     // 生成中
  | 'success'        // 成功
  | 'error'          // 失败

// 错误信息
export interface PlanGenerationError {
  code: string
  message: string
}

// ============================================
// 辅助函数
// ============================================

// 计算 BMI
export function calculateBMI(weight: number, height: number): number {
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

// BMI 分类
export function getBMICategory(bmi: number): {
  category: string
  color: string
  description: string
} {
  if (bmi < 18.5) {
    return {
      category: '偏瘦',
      color: 'text-yellow-600',
      description: '建议增肌和适当增重'
    }
  } else if (bmi < 24) {
    return {
      category: '正常',
      color: 'text-green-600',
      description: '保持当前状态，适度锻炼'
    }
  } else if (bmi < 28) {
    return {
      category: '超重',
      color: 'text-orange-600',
      description: '建议减脂和增加运动'
    }
  } else {
    return {
      category: '肥胖',
      color: 'text-red-600',
      description: '建议先从低强度运动开始，逐步增加'
    }
  }
}

// 目标中文映射
export const goalLabels: Record<FitnessGoal, string> = {
  'muscle': '增肌',
  'fat-loss': '减脂',
  'tone': '塑形',
  'fitness': '提升体能'
}

// 偏好中文映射
export const preferenceLabels: Record<FitnessPreference, string> = {
  'home': '居家训练',
  'gym': '健身房',
  'no-equipment': '无器械',
  'dumbbells': '哑铃',
  'barbell': '杠铃',
  'treadmill': '跑步机',
  'resistance-bands': '弹力带',
  'pull-up-bar': '单杠'
}

// 经验水平中文映射
export const experienceLabels: Record<ExperienceLevel, string> = {
  'beginner': '零基础',
  'intermediate': '有一定基础',
  'advanced': '经验丰富'
}
