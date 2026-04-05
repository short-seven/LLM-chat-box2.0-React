import { useSettingStore } from '../stores/settingStore';

const API_BASE_URL = 'https://api.siliconflow.cn/v1';

const TITLE_PROMPT = `你是一个对话标题生成助手。根据用户的第一句话，生成一个简洁的对话标题。
规则：
- 长度：5~15个字
- 不要标点符号结尾
- 去掉"请问""帮我""怎么""可以吗"等无意义词
- 直接输出标题，不要解释，不要引号
- 支持中英文`;

export const generateConversationTitle = async (firstMessage: string): Promise<string> => {
  const { settings } = useSettingStore.getState();
  const fallback = firstMessage.slice(0, 15).replace(/[？?。！!，,]/g, '').trim();

  if (!settings.apiKey.trim()) return fallback;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: TITLE_PROMPT },
          { role: 'user', content: `用户消息：${firstMessage}` },
        ],
        stream: false,
        max_tokens: 30,
        temperature: 0.3,
      }),
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const title = data.choices?.[0]?.message?.content?.trim();
    return title && title.length > 0 ? title : fallback;
  } catch {
    return fallback;
  }
};

export const createChatCompletion = async (messages: Array<{ role: string; content: string }>) => {
  const { settings } = useSettingStore.getState();

  if (!settings.apiKey.trim()) {
    throw new Error('Missing API key. Please configure your SiliconFlow API key in settings or .env.local.');
  }

  const payload = {
    model: settings.model,
    messages,
    stream: settings.stream,
    max_tokens: settings.maxTokens,
    temperature: settings.temperature,
    top_p: settings.topP,
    top_k: settings.topK,
  };

  const options: RequestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE_URL}/chat/completions`, options);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (settings.stream) {
      return response; // Return response object for streaming
    } else {
      const data = await response.json();
      const duration = (Date.now() - startTime) / 1000;
      data.speed = (data.usage.completion_tokens / duration).toFixed(2);
      return data;
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
};
