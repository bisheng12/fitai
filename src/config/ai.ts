// ============================================
// FitAI - AI 服务配置
// 管理 AI API 的配置和默认设置
// ============================================

export interface AIConfig {
  baseUrl: string      // API 地址
  apiKey: string       // API 密钥
  model: string        // 模型名称
  temperature: number  // 创造性参数 (0-1)
  timeout: number      // 超时时间 (毫秒)
}

// 默认配置 (开发环境)
export const defaultConfig: AIConfig = {
  baseUrl: import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-4',
  temperature: 0.7,
  timeout: 300000 // 5分钟超时
}

// 支持的模型列表 (供用户选择)
export const availableModels = [
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', description: '最强大，响应较慢' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', description: '快速且强大' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5', provider: 'OpenAI', description: '快速，够用' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: '极其强大' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', description: '平衡之选' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: '性价比高' }
]