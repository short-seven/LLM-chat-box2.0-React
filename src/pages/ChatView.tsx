import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useSettingStore } from '../stores/settingStore';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import ChatLayout from '../components/layout/ChatLayout';
import TopBar from '../components/layout/TopBar';
import SettingsPanel from '../components/SettingsPanel';
import { createChatCompletion } from '../utils/api';
import { messageHandler } from '../utils/messageHandler';
import dialogIcon from '../assets/photo/对话.png';
import './ChatView.scss';

const ChatView: React.FC = () => {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);

  const chatStore = useChatStore();
  const settingStore = useSettingStore();
  const currentMessages = chatStore.currentMessages();
  const isLoading = chatStore.isLoading;

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [currentMessages]);

  useEffect(() => {
    if (chatStore.conversations.length === 0) {
      chatStore.createConversation();
    }
  }, []);

  const handleSend = async (messageContent: { text: string; files: any[] }) => {
    try {
      chatStore.addMessage(
        messageHandler.formatMessage('user', messageContent.text, '', messageContent.files)
      );
      chatStore.addMessage(messageHandler.formatMessage('assistant', '', ''));
      chatStore.setIsLoading(true);

      const lastMessage = chatStore.getLastMessage();
      if (lastMessage) lastMessage.loading = true;

      const allMessages = chatStore.currentMessages();
      const messages = allMessages
        .filter((msg) => msg.content.trim() !== '')
        .map(({ role, content }) => ({ role, content }));

      const response = await createChatCompletion(messages);

      await messageHandler.handleResponse(
        response,
        settingStore.settings.stream,
        (content, reasoning_content, tokens, speed) => {
          chatStore.updateLastMessage(content, reasoning_content, tokens, speed);
        }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
      chatStore.updateLastMessage('抱歉，发生了一些错误，请稍后重试。');
    } finally {
      chatStore.setIsLoading(false);
      const lastMessage = chatStore.getLastMessage();
      if (lastMessage) lastMessage.loading = false;
    }
  };

  const handleRegenerate = async () => {
    try {
      const messages = currentMessages;
      if (messages.length < 2) return;
      const lastUserMessage = messages[messages.length - 2];
      messages.splice(-2, 2);
      chatStore.addMessage({
        ...messageHandler.formatMessage('user', lastUserMessage.content, '', lastUserMessage.files),
      });
      await handleSend({ text: lastUserMessage.content, files: lastUserMessage.files || [] });
    } catch (error) {
      console.error('Failed to regenerate:', error);
    }
  };

  return (
    <ChatLayout topBar={<TopBar onOpenSettings={() => setShowSettings(true)} />}>
      <div className="messages-container" ref={messagesContainerRef}>
        {currentMessages.length > 0 ? (
          currentMessages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isLastAssistantMessage={
                index === currentMessages.length - 1 && message.role === 'assistant'
              }
              onRegenerate={handleRegenerate}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-content">
              <img src={dialogIcon} alt="chat" className="empty-icon" />
              <h2>开始对话吧</h2>
              <p>有什么想和我聊的吗？</p>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-container">
        <ChatInput loading={isLoading} onSend={handleSend} />
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </ChatLayout>
  );
};

export default ChatView;
