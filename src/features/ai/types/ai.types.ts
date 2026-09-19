// ============================================================
// AI AGENT TYPES
// Định nghĩa kiểu dữ liệu cho Trợ lý ảo AI CIVIL-PRO
// ============================================================

export interface ChatMessage {
  id       : string;
  sender   : 'user' | 'assistant' | 'system';
  text     : string;
  timestamp: number;
}

export interface QuickPrompt {
  id   : string;
  icon : string;
  label: string;
  query: string;
}

export interface AiConfig {
  apiKey  : string;
  provider: 'gemini' | 'openai' | 'custom';
  model   : string;
}
