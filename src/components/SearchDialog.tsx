import React, { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import { createChatCompletion } from '../utils/api';
import { messageHandler } from '../utils/messageHandler';
import { useSettingStore } from '../stores/settingStore';
import type { Message } from '../stores/chatStore';
import enterIcon from '../assets/photo/回车.png';
import './SearchDialog.scss';

const SearchDialog: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const settingStore = useSettingStore();

  const aiMessage = 'Hi, 我是你的AI小助手，有什么问题都可以问我！';
  const suggestedPrompts = [
    '如何快速上手Vue3框架',
    '入职字节跳动难吗？',
    '前端如何实现弹性布局',
    '喝酒脸红是会喝酒的表现吗？',
  ];

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!searchText.trim() || isLoading) return;

    try {
      setIsLoading(true);

      const userMessage = messageHandler.formatMessage('user', searchText.trim());
      const assistantMessage = messageHandler.formatMessage('assistant', '', '');
      assistantMessage.loading = true;

      setMessages([...messages, userMessage, assistantMessage]);
      setSearchText('');

      const messagesForAPI = [...messages, userMessage].map(({ role, content }) => ({
        role,
        content,
      }));
      const response = await createChatCompletion(messagesForAPI);

      await messageHandler.handleResponse(
        response,
        settingStore.settings.stream,
        (content, reasoning_content, tokens, speed) => {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            lastMessage.content = content;
            lastMessage.reasoning_content = reasoning_content;
            lastMessage.completion_tokens = tokens;
            lastMessage.speed = speed;
            return newMessages;
          });
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.content = '抱歉，发生了一些错误，请稍后重试。';
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        lastMessage.loading = false;
        return newMessages;
      });
    }
  };

  const handleRegenerate = async () => {
    try {
      if (messages.length < 2) return;

      const lastUserMessage = messages[messages.length - 2];
      setMessages(messages.slice(0, -2));

      setSearchText(lastUserMessage.content);
      setTimeout(() => handleSend(), 100);
    } catch (error) {
      console.error('Failed to regenerate message:', error);
    }
  };

  return (
    <div className="search-dialog">
      <div className="search-header">
        <div className="search-input">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="提问"
            autoFocus
          />
          <button className="action-btn" onClick={handleSend} disabled={isLoading}>
            <img src={enterIcon} alt="enter" />
          </button>
        </div>
      </div>

      <div className="dialog-content" ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <>
            <div className="initial-message">{aiMessage}</div>
            <div className="suggested-prompts">
              <div className="prompt-title">建议提示词</div>
              <div className="prompt-list">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    className="prompt-item"
                    onClick={() => setSearchText(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastAssistantMessage={
                index === messages.length - 1 && message.role === 'assistant'
              }
              onRegenerate={handleRegenerate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default SearchDialog;
