import { useSettingStore } from '../stores/settingStore';

const API_BASE_URL = 'https://api.siliconflow.cn/v1';

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
