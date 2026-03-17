// 用于生成唯一ID的计数器
let messageIdCounter = 0;

export const messageHandler = {
  formatMessage(
    role: 'user' | 'assistant',
    content: string,
    reasoning_content: string = '',
    files: any[] = []
  ) {
    // 组合时间戳和递增计数器确保唯一性
    const id = Date.now() * 1000 + (messageIdCounter++ % 1000);
    return {
      id,
      role,
      content,
      reasoning_content,
      files,
      completion_tokens: 0,
      speed: 0,
      loading: false,
    };
  },

  // Handle streaming response
  async handleStreamResponse(
    response: Response,
    updateCallback: (
      content: string,
      reasoning_content: string,
      tokens: number,
      speed: number
    ) => void
  ) {
    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let startTime = Date.now();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter((line) => line.trim() !== '');

      for (const line of lines) {
        if (line === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(5));
          const content = data.choices[0].delta.content || '';
          const reasoning = data.choices[0].delta.reasoning_content || '';

          accumulatedContent += content;
          accumulatedReasoning += reasoning;

          updateCallback(
            accumulatedContent,
            accumulatedReasoning,
            data.usage?.completion_tokens || 0,
            parseFloat(
              (
                (data.usage?.completion_tokens || 0) /
                ((Date.now() - startTime) / 1000)
              ).toFixed(2)
            )
          );
        }
      }
    }
  },

  // Handle normal response
  handleNormalResponse(
    response: any,
    updateCallback: (
      content: string,
      reasoning_content: string,
      tokens: number,
      speed: number
    ) => void
  ) {
    updateCallback(
      response.choices[0].message.content,
      response.choices[0].message.reasoning_content || '',
      response.usage.completion_tokens,
      parseFloat(response.speed)
    );
  },

  // Unified response handler
  async handleResponse(
    response: any,
    isStream: boolean,
    updateCallback: (
      content: string,
      reasoning_content: string,
      tokens: number,
      speed: number
    ) => void
  ) {
    if (isStream) {
      await this.handleStreamResponse(response, updateCallback);
    } else {
      this.handleNormalResponse(response, updateCallback);
    }
  },
};
