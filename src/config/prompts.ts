// ============================================
// FitAI - Prompt 模板
// 精心设计的 Prompt，确保 AI 输出高质量健身计划
// ============================================

import type { UserProfile } from '../types'
import { goalLabels, preferenceLabels, experienceLabels } from '../types'

/**
 * 生成健身计划 Prompt
 * @param profile 用户信息
 * @returns 格式化后的 Prompt
 */
export function generateFitnessPrompt(profile: UserProfile): string {
  // 格式化偏好列表
  const preferencesText = profile.preferences
    .map(p => preferenceLabels[p])
    .join('、')

  // 格式化性别
  const genderText = profile.gender === 'male' ? '男性' : '女性'

  // 格式化目标
  const goalText = goalLabels[profile.goal]

  // 格式化经验
  const experienceText = experienceLabels[profile.experience]

  // 计算 BMI
  const heightInM = profile.height / 100
  const bmi = (profile.weight / (heightInM * heightInM)).toFixed(1)

  return `你是专业健身教练。请严格按照以下JSON格式返回健身计划，不要输出任何其他文字。

**用户信息**：
- ${profile.age}岁${genderText}
- 身高${profile.height}cm，体重${profile.weight}kg
- 目标：${goalText}
- 环境：${preferencesText}
- 经验：${experienceText}
- 每周${profile.daysPerWeek}天，每次${profile.durationPerSession}分钟
- 周期：${profile.planWeeks}周

请生成JSON（简洁版，动作数量精简，每周四动即可）：

{
  "overview": {
    "title": "计划标题",
    "duration": "${profile.planWeeks}周",
    "difficulty": "初级/中级/高级",
    "expectedResult": "预期效果",
    "targetCalories": 1800-2200,
    "targetProtein": 100-150
  },
  "weeks": [
    {
      "weekNumber": 1,
      "theme": "本周主题",
      "focus": "本周重点",
      "days": [
        {
          "dayOfWeek": "周一",
          "dayNumber": 1,
          "isRestDay": false,
          "focus": "训练重点",
          "duration": ${profile.durationPerSession},
          "warmup": "热身",
          "exercises": [
            {"id": "e1", "name": "动作1", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e2", "name": "动作2", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e3", "name": "动作3", "category": "isolation", "sets": 3, "reps": "12-15次", "rest": "45秒", "note": "要点"},
            {"id": "e4", "name": "动作4", "category": "core", "sets": 3, "reps": "20秒", "rest": "30秒", "note": "要点"}
          ],
          "cooldown": "放松拉伸",
          "notes": ""
        },
        {"dayOfWeek": "周二", "dayNumber": 2, "isRestDay": true, "focus": "休息", "duration": 0, "warmup": "", "exercises": [], "cooldown": "", "notes": "充分休息恢复"},
        {"dayOfWeek": "周三", "dayNumber": 3, "isRestDay": false, "focus": "训练重点", "duration": ${profile.durationPerSession}, "warmup": "热身", "exercises": [
            {"id": "e1", "name": "动作1", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e2", "name": "动作2", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e3", "name": "动作3", "category": "isolation", "sets": 3, "reps": "12-15次", "rest": "45秒", "note": "要点"},
            {"id": "e4", "name": "动作4", "category": "core", "sets": 3, "reps": "20秒", "rest": "30秒", "note": "要点"}
          ], "cooldown": "放松拉伸", "notes": ""},
        {"dayOfWeek": "周四", "dayNumber": 4, "isRestDay": true, "focus": "休息", "duration": 0, "warmup": "", "exercises": [], "cooldown": "", "notes": "充分休息恢复"},
        {"dayOfWeek": "周五", "dayNumber": 5, "isRestDay": false, "focus": "训练重点", "duration": ${profile.durationPerSession}, "warmup": "热身", "exercises": [
            {"id": "e1", "name": "动作1", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e2", "name": "动作2", "category": "compound", "sets": 3, "reps": "10-12次", "rest": "60秒", "note": "要点"},
            {"id": "e3", "name": "动作3", "category": "isolation", "sets": 3, "reps": "12-15次", "rest": "45秒", "note": "要点"},
            {"id": "e4", "name": "动作4", "category": "core", "sets": 3, "reps": "20秒", "rest": "30秒", "note": "要点"}
          ], "cooldown": "放松拉伸", "notes": ""},
        {"dayOfWeek": "周六", "dayNumber": 6, "isRestDay": true, "focus": "休息", "duration": 0, "warmup": "", "exercises": [], "cooldown": "", "notes": "充分休息恢复"},
        {"dayOfWeek": "周日", "dayNumber": 7, "isRestDay": true, "focus": "休息", "duration": 0, "warmup": "", "exercises": [], "cooldown": "", "notes": "充分休息恢复"}
      ]
    }
  ],
  "diet": {
    "principle": "饮食原则描述",
    "dailyCalories": 每日总热量,
    "macros": {
      "protein": 120-150,
      "carbs": 150-200,
      "fat": 40-60
    },
    "meals": {
      "breakfast": {
        "name": "早餐",
        "timeRange": "7:00-8:00",
        "description": "高蛋白早餐",
        "foods": [
          {"name": "鸡蛋", "amount": "2-3个"},
          {"name": "全麦面包", "amount": "2片"},
          {"name": "牛奶", "amount": "200ml"}
        ],
        "calories": 400-500,
        "protein": 25-30,
        "carbs": 40-50,
        "fat": 15-20
      },
      "lunch": {
        "name": "午餐",
        "timeRange": "12:00-13:00",
        "description": "主食+蛋白质+蔬菜",
        "foods": [
          {"name": "米饭", "amount": "150g"},
          {"name": "鸡胸肉/鱼", "amount": "150g"},
          {"name": "蔬菜", "amount": "200g"}
        ],
        "calories": 500-600,
        "protein": 40-50,
        "carbs": 60-70,
        "fat": 10-15
      },
      "dinner": {
        "name": "晚餐",
        "timeRange": "18:00-19:00",
        "description": "清淡易消化",
        "foods": [
          {"name": "红薯/糙米", "amount": "100g"},
          {"name": "鱼/虾", "amount": "150g"},
          {"name": "蔬菜沙拉", "amount": "150g"}
        ],
        "calories": 400-500,
        "protein": 35-45,
        "carbs": 40-50,
        "fat": 10-15
      },
      "snacks": [
        {
          "name": "下午加餐",
          "timeRange": "15:00",
          "description": "蛋白质零食",
          "foods": [
            {"name": "坚果", "amount": "30g"},
            {"name": "水果", "amount": "1个"}
          ],
          "calories": 150-200,
          "protein": 5-10,
          "carbs": 15-20,
          "fat": 10-15
        }
      ]
    },
    "waterIntake": "每天2-3升水",
    "supplements": ["蛋白粉（可选）", "复合维生素"],
    "warnings": ["训练后及时补充蛋白质", "避免过度节食"]
  },
  "tips": [
    "训练前充分热身5-10分钟",
    "保持充足睡眠7-8小时",
    "循序渐进增加重量"
  ]
}

确保JSON格式正确，可直接解析。`
}

/**
 * 系统提示词
 * 告诉 AI 它是什么角色
 */
export const systemPrompt = `你是一位专业、权威的健身教练和营养师。你的职责是根据用户的身体数据和健身目标，生成科学、专业、个性化的健身和饮食计划。

你的回答应该：
1. 专业且循证 - 基于运动科学原理
2. 实用可执行 - 每个动作都要清晰明了
3. 安全第一 - 考虑用户的实际能力
4. 因人而异 - 根据用户具体情况定制

重要提醒：
- 所有数据必须科学合理
- 训练强度必须与目标匹配
- 饮食计划必须可执行
- 考虑用户的设备限制`
