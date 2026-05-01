// ============================================
// FitAI - AI 服务层
// 负责调用 AI API 生成健身计划
// ============================================

import type { UserProfile, FitnessPlan } from '../types'
import { defaultConfig } from '../config/ai'
import { generateFitnessPrompt } from '../config/prompts'

export interface AIServiceConfig {
  baseUrl: string
  apiKey: string
  model: string
  temperature: number
  timeout: number
}

export interface GenerationResult {
  success: boolean
  data?: FitnessPlan
  error?: string
  debugInfo?: string  // 用于调试的信息
}

/**
 * AI 服务类
 * 处理所有与 AI API 的交互
 */
class AIService {
  private config: AIServiceConfig

  constructor(config?: Partial<AIServiceConfig>) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AIServiceConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取当前配置
   */
  getConfig(): AIServiceConfig {
    return { ...this.config }
  }

  /**
   * 生成健身计划
   */
  async generateFitnessPlan(userProfile: UserProfile): Promise<GenerationResult> {
    try {
      // 检查 API Key
      if (!this.config.apiKey) {
        console.log('⚠️ 未配置 API Key，使用本地模板')
        return {
          success: true,
          data: this.generateLocalPlan(userProfile),
          debugInfo: '使用本地模板生成（未配置 AI）'
        }
      }

      // 生成 Prompt
      const userPrompt = generateFitnessPrompt(userProfile)
      console.log('📤 发送请求到 AI...')
      console.log('Model:', this.config.model)
      console.log('BaseURL:', this.config.baseUrl)

      // 调用 API
      const response = await this.callAI(userPrompt)
      console.log('📥 收到 AI 响应，长度:', response.length, '字符')

      // 解析响应
      const parseResult = this.parseResponse(response)

      if (!parseResult.success) {
        console.log('⚠️ AI 生成失败，使用本地模板作为 fallback')
        return {
          success: true,
          data: this.generateLocalPlan(userProfile),
          debugInfo: `AI 生成失败: ${parseResult.error}，已使用本地模板`
        }
      }

      console.log('✅ JSON 解析成功!')
      return {
        success: true,
        data: parseResult.data
      }
    } catch (error) {
      console.error('❌ 生成健身计划失败:', error)
      console.log('⚠️ 发生异常，使用本地模板作为 fallback')
      return {
        success: true,
        data: this.generateLocalPlan(userProfile),
        debugInfo: `发生错误: ${error instanceof Error ? error.message : '未知错误'}，已使用本地模板`
      }
    }
  }

  /**
   * 调用 AI API (支持 DeepSeek 和 Gemini 格式)
   */
  private async callAI(userPrompt: string): Promise<string> {
    // 检测是否使用 Gemini API
    const isGemini = this.config.baseUrl.includes('generativelanguage.googleapis.com')

    if (isGemini) {
      // Gemini API 格式
      const modelName = this.config.model.includes('gemini') ? this.config.model : `models/${this.config.model}`
      const url = `${this.config.baseUrl}/${modelName}:generateContent?key=${this.config.apiKey}`

      console.log('🌐 Gemini API URL:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `你是一位专业健身教练。请只返回JSON格式的计划，不要返回其他文字。\n\n${userPrompt}`
            }]
          }],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: 8000
          }
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      })

      console.log('📡 HTTP 状态码:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error?.message || `API 请求失败: ${response.status}`
        console.error('❌ API 错误:', errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        console.error('❌ Gemini 响应结构异常:', JSON.stringify(data).substring(0, 200))
        throw new Error('API 返回数据格式错误')
      }

      return data.candidates[0].content.parts[0].text

    } else {
      // DeepSeek/OpenAI 格式
      const url = `${this.config.baseUrl}/chat/completions`

      console.log('🌐 API URL:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: '你是一位专业健身教练。请只返回JSON格式的计划，不要返回其他文字。' },
            { role: 'user', content: userPrompt }
          ],
          temperature: this.config.temperature,
          max_tokens: 8000
        }),
        signal: AbortSignal.timeout(this.config.timeout)
      })

      console.log('📡 HTTP 状态码:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error?.message || `API 请求失败: ${response.status}`
        console.error('❌ API 错误:', errorMsg)
        throw new Error(errorMsg)
      }

      const data = await response.json()

      if (!data.choices || !data.choices[0]?.message?.content) {
        console.error('❌ 响应结构异常:', JSON.stringify(data).substring(0, 200))
        throw new Error('API 返回数据格式错误')
      }

      return data.choices[0].message.content
    }
  }

  /**
   * 解析 AI 响应
   * 提取 JSON 并验证格式
   * 包含智能修复机制，处理 JSON 被截断的情况
   */
  private parseResponse(content: string): { success: boolean; data?: FitnessPlan; error?: string } {
    try {
      // 记录原始响应
      console.log('📝 原始响应内容:')
      console.log('长度:', content.length, '字符')
      console.log('末尾100字符:', content.slice(-100))

      // 清理响应内容
      let jsonStr = content.trim()

      // 方法1: 移除 markdown 代码块
      const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
      if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim()
        console.log('✅ 检测到代码块，已提取')
      }

      // 方法2: 找到 JSON 对象的边界
      const firstBrace = jsonStr.indexOf('{')
      const lastBrace = jsonStr.lastIndexOf('}')

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1)
        console.log('✅ 已定位 JSON 边界')
      }

      // 移除可能的前缀文字
      jsonStr = jsonStr.replace(/^[\s\S]*?(\{)/, '$1')

      console.log('🔍 解析 JSON (长度:', jsonStr.length, ')')

      // 检查 JSON 是否被截断（检查是否以完整结构结尾）
      const isTruncated = this.isJsonTruncated(jsonStr)
      
      if (isTruncated) {
        console.log('⚠️ 检测到 JSON 被截断，尝试智能修复...')
        jsonStr = this.fixTruncatedJson(jsonStr)
        console.log('🔧 修复后长度:', jsonStr.length)
      }

      // 解析 JSON
      let data = JSON.parse(jsonStr)

      // 验证必需字段
      const validation = this.validatePlanData(data)
      if (!validation.valid) {
        // 如果数据不完整但我们修复了截断，尝试补全
        console.log('⚠️ 数据验证失败，缺失字段:', validation.missingFields)
        data = this.fillMissingFields(data)
        const reValidation = this.validatePlanData(data)
        if (!reValidation.valid) {
          console.error('❌ 数据仍然不完整')
          return {
            success: false,
            error: `AI 返回数据不完整，缺失: ${reValidation.missingFields.join(', ')}`
          }
        }
      }

      console.log('✅ 数据验证通过!')
      return {
        success: true,
        data: data as FitnessPlan
      }
    } catch (error) {
      console.error('❌ JSON 解析失败:', error)
      return {
        success: false,
        error: `JSON 解析失败: ${error instanceof Error ? error.message : '未知错误'}`
      }
    }
  }

  /**
   * 检测 JSON 是否被截断
   */
  private isJsonTruncated(jsonStr: string): boolean {
    // 检查常见截断特征
    const truncatedPatterns = [
      /"warmup":\s*"[^"]*$/,          // warmup 字段未关闭
      /"cooldown":\s*"[^"]*$/,         // cooldown 字段未关闭
      /"name":\s*"[^"]*$/,             // name 字段未关闭
      /"description":\s*"[^"]*$/,      // description 字段未关闭
      /"focus":\s*"[^"]*$/,            // focus 字段未关闭
      /"theme":\s*"[^"]*$/,            // theme 字段未关闭
      /"note":\s*"[^"]*$/,             // note 字段未关闭
      /"foods":\s*\[\s*\{[^}]*$/,      // foods 数组未关闭
      /"exercises":\s*\[[^\]]*$/,      // exercises 数组未关闭
      /"meals":\s*\{[^}]*$/,           // meals 对象未关闭
      /\{\s*"[^"]*$/,                  // 对象未关闭
    ]

    for (const pattern of truncatedPatterns) {
      if (pattern.test(jsonStr)) {
        return true
      }
    }
    return false
  }

  /**
   * 修复被截断的 JSON
   */
  private fixTruncatedJson(jsonStr: string): string {
    let fixed = jsonStr

    // 策略1: 补全未闭合的引号和括号
    // 移除末尾不完整的字符串（如 "5分钟椭圆机+ 而非 "5分钟椭圆机"）
    fixed = fixed.replace(/["\u201c\u201d]\s*$/, '')  // 移除末尾的引号
    fixed = fixed.replace(/[+\-*]\s*$/, '')           // 移除末尾的连接符
    
    // 策略2: 补全未闭合的数组
    // 统计 [ 和 ] 的数量
    const openBrackets = (fixed.match(/\[/g) || []).length
    const closeBrackets = (fixed.match(/\]/g) || []).length
    for (let i = closeBrackets; i < openBrackets; i++) {
      fixed += ']'
    }

    // 策略3: 补全未闭合的对象
    const openBraces = (fixed.match(/\{/g) || []).length
    const closeBraces = (fixed.match(/\}/g) || []).length
    for (let i = closeBraces; i < openBraces; i++) {
      fixed += '}'
    }

    // 策略4: 移除末尾逗号
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1')

    // 策略5: 如果末尾仍然没有闭合，尝试智能补全
    if (!fixed.endsWith('}')) {
      // 尝试找到最后一个完整的字段并闭合
      fixed = fixed.replace(/,?\s*"[^"]*"\s*:?\s*[^,}\]]*$/, '')
      fixed += '}'
    }

    return fixed
  }

  /**
   * 填充缺失的字段
   */
  private fillMissingFields(data: any): any {
    const filled = { ...data }

    // 确保 overview 存在
    if (!filled.overview) {
      filled.overview = {
        title: '健身计划',
        duration: '2周',
        difficulty: '初级',
        expectedResult: '提升体能',
        targetCalories: 2000,
        targetProtein: 120
      }
    }

    // 确保 weeks 存在
    if (!filled.weeks || !Array.isArray(filled.weeks)) {
      filled.weeks = [{
        weekNumber: 1,
        theme: '基础训练',
        focus: '建立运动习惯',
        days: []
      }]
    }

    // 确保 tips 存在
    if (!filled.tips || !Array.isArray(filled.tips)) {
      filled.tips = [
        '训练前充分热身',
        '保持充足睡眠',
        '循序渐进增加强度'
      ]
    }

    return filled
  }

  /**
   * 使用本地模板生成健身计划
   * 当 AI 生成失败时的 fallback 方案
   */
  private generateLocalPlan(profile: UserProfile): FitnessPlan {
    const goalTexts: Record<string, { title: string; result: string; difficulty: string }> = {
      'muscle': { title: '增肌训练计划', result: '增加肌肉量，提升力量', difficulty: '初级' },
      'fat-loss': { title: '减脂塑形计划', result: '减少体脂，塑造线条', difficulty: '初级' },
      'tone': { title: '紧致塑形计划', result: '紧致身材，提升气质', difficulty: '初级' },
      'fitness': { title: '综合健身计划', result: '提升整体体能和健康', difficulty: '初级' }
    }

    const goal = goalTexts[profile.goal] || goalTexts['fitness']

    // 根据用户偏好选择动作
    const hasHome = profile.preferences.includes('home')
    const hasGym = profile.preferences.includes('gym')
    const hasDumbbells = profile.preferences.includes('dumbbells')
    const hasBarbell = profile.preferences.includes('barbell')
    const hasNoEquipment = profile.preferences.includes('no-equipment')

    // 生成动作列表
    const exercises = []
    
    if (hasGym || hasDumbbells || hasBarbell) {
      exercises.push(
        { id: 'e1', name: '哑铃卧推', category: 'compound', sets: 3, reps: '10-12次', rest: '60秒', note: '保持核心收紧' },
        { id: 'e2', name: '哑铃深蹲', category: 'compound', sets: 3, reps: '12-15次', rest: '60秒', note: '膝盖与脚尖同向' },
        { id: 'e3', name: '哑铃划船', category: 'compound', sets: 3, reps: '10-12次', rest: '60秒', note: '背部发力' },
        { id: 'e4', name: '平板支撑', category: 'core', sets: 3, reps: '30秒', rest: '30秒', note: '保持身体一条直线' }
      )
    } else {
      exercises.push(
        { id: 'e1', name: '俯卧撑', category: 'compound', sets: 3, reps: '10-15次', rest: '60秒', note: '标准或跪姿' },
        { id: 'e2', name: '深蹲跳', category: 'compound', sets: 3, reps: '12-15次', rest: '60秒', note: '落地轻盈' },
        { id: 'e3', name: '波比跳', category: 'cardio', sets: 3, reps: '8-10次', rest: '60秒', note: '核心收紧' },
        { id: 'e4', name: '平板支撑', category: 'core', sets: 3, reps: '30秒', rest: '30秒', note: '保持身体一条直线' }
      )
    }

    // 根据健身目标调整训练内容
    if (profile.goal === 'fat-loss') {
      exercises.push({ id: 'e5', name: '高抬腿', category: 'cardio', sets: 3, reps: '30秒', rest: '30秒', note: '快速燃烧脂肪' })
    }

    // 生成每日计划
    const days = []
    const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const trainingDays = profile.daysPerWeek

    for (let i = 0; i < 7; i++) {
      if (i < trainingDays) {
        days.push({
          dayOfWeek: dayNames[i],
          dayNumber: i + 1,
          isRestDay: false,
          focus: profile.goal === 'muscle' ? '力量训练' : profile.goal === 'fat-loss' ? '燃脂训练' : '综合训练',
          duration: profile.durationPerSession,
          warmup: '5分钟慢跑或原地踏步热身',
          exercises: exercises,
          cooldown: '5分钟拉伸放松',
          notes: '注意补充水分'
        })
      } else {
        days.push({
          dayOfWeek: dayNames[i],
          dayNumber: i + 1,
          isRestDay: true,
          focus: '休息',
          duration: 0,
          warmup: '',
          exercises: [],
          cooldown: '',
          notes: '充分休息，帮助肌肉恢复'
        })
      }
    }

    return {
      overview: {
        title: goal.title,
        duration: `${profile.planWeeks}周`,
        difficulty: goal.difficulty,
        expectedResult: goal.result,
        targetCalories: profile.goal === 'fat-loss' ? 1800 : 2200,
        targetProtein: profile.goal === 'muscle' ? 150 : 120
      },
      weeks: [
        {
          weekNumber: 1,
          theme: '基础适应期',
          focus: '建立运动习惯，掌握正确动作',
          days: days
        }
      ],
      diet: {
        principle: '均衡饮食，少油少盐，补充优质蛋白质',
        dailyCalories: profile.goal === 'fat-loss' ? 1800 : 2200,
        macros: {
          protein: profile.goal === 'muscle' ? 150 : 120,
          carbs: profile.goal === 'fat-loss' ? 150 : 200,
          fat: 50
        },
        meals: {
          breakfast: {
            name: '早餐',
            timeRange: '7:00-8:00',
            description: '高蛋白早餐',
            foods: [
              { name: '鸡蛋', amount: '2-3个' },
              { name: '全麦面包', amount: '2片' },
              { name: '牛奶/豆浆', amount: '200ml' }
            ],
            calories: 450,
            protein: 28,
            carbs: 45,
            fat: 18
          },
          lunch: {
            name: '午餐',
            timeRange: '12:00-13:00',
            description: '主食+蛋白质+蔬菜',
            foods: [
              { name: '米饭/面食', amount: '150g' },
              { name: '鸡胸肉/鱼', amount: '150g' },
              { name: '蔬菜', amount: '200g' }
            ],
            calories: 550,
            protein: 45,
            carbs: 65,
            fat: 12
          },
          dinner: {
            name: '晚餐',
            timeRange: '18:00-19:00',
            description: '清淡易消化',
            foods: [
              { name: '红薯/糙米', amount: '100g' },
              { name: '鱼/虾', amount: '150g' },
              { name: '蔬菜沙拉', amount: '150g' }
            ],
            calories: 420,
            protein: 40,
            carbs: 45,
            fat: 10
          },
          snacks: [
            {
              name: '下午加餐',
              timeRange: '15:00',
              description: '蛋白质零食',
              foods: [
                { name: '坚果', amount: '30g' },
                { name: '水果', amount: '1个' }
              ],
              calories: 180,
              protein: 5,
              carbs: 18,
              fat: 12
            }
          ]
        },
        waterIntake: '每天2-3升水，训练中及时补水',
        supplements: ['蛋白粉（可选）', '复合维生素'],
        warnings: ['训练后30分钟内补充蛋白质', '避免过度节食', '保证充足睡眠']
      },
      tips: [
        '训练前充分热身5-10分钟',
        '每个动作注意控制离心收缩',
        '保持充足睡眠7-8小时',
        '循序渐进增加训练重量',
        '训练后及时补充蛋白质',
        '记录训练日志，追踪进步'
      ]
    }
  }

  /**
   * 验证计划数据
   */
  private validatePlanData(data: any): { valid: boolean; missingFields: string[] } {
    const requiredFields = ['overview', 'weeks', 'diet', 'tips']
    const missing: string[] = []

    for (const field of requiredFields) {
      if (!data[field]) {
        missing.push(field)
      }
    }

    // 检查 weeks 是否为数组
    if (data.weeks && !Array.isArray(data.weeks)) {
      missing.push('weeks (不是数组)')
    }

    // 检查 tips 是否为数组
    if (data.tips && !Array.isArray(data.tips)) {
      missing.push('tips (不是数组)')
    }

    return {
      valid: missing.length === 0,
      missingFields: missing
    }
  }

  /**
   * 测试 API 连接
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.config.apiKey) {
        return { success: false, message: '请输入 API Key' }
      }

      // 发送一个简单的测试请求
      const url = `${this.config.baseUrl}/chat/completions`
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: '回复 OK' }],
          max_tokens: 10
        })
      })

      if (response.ok) {
        return { success: true, message: 'API 连接成功!' }
      } else {
        const error = await response.json().catch(() => ({}))
        return { success: false, message: error.error?.message || '连接失败' }
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : '连接失败'
      }
    }
  }
}

// 导出单例
export const aiService = new AIService()

// 导出工厂函数
export function createAIService(config?: Partial<AIServiceConfig>): AIService {
  return new AIService(config)
}
