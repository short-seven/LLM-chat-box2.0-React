import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../stores/chatStore';
import { useSettingStore } from '../stores/settingStore';
import ChatInput from '../components/ChatInput';
import ChatMessage from '../components/ChatMessage';
import PopupMenu from '../components/PopupMenu';
import SettingsPanel from '../components/SettingsPanel';
import DialogEdit from '../components/DialogEdit';
import { createChatCompletion } from '../utils/api';
import { messageHandler } from '../utils/messageHandler';
import settingIcon from '../assets/photo/设置.png';
import backIcon from '../assets/photo/返回.png';
import editIcon from '../assets/photo/编辑.png';
import dialogIcon from '../assets/photo/对话.png';
import './ChatView.scss';

const ChatView: React.FC = () => {
  const navigate = useNavigate();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [dialogEditState, setDialogEditState] = useState<{
    visible: boolean;
    conversationId: string;
    type: 'edit' | 'delete';
  }>({ visible: false, conversationId: '', type: 'edit' });

  const chatStore = useChatStore();
  const settingStore = useSettingStore();
  const currentMessages = chatStore.currentMessages();
  const isLoading = chatStore.isLoading;
  const currentConversation = chatStore.currentConversation();

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
      // 添加用户消息
      chatStore.addMessage(
        messageHandler.formatMessage('user', messageContent.text, '', messageContent.files)
      );
      // 添加空的助手消息占位
      chatStore.addMessage(messageHandler.formatMessage('assistant', '', ''));

      chatStore.setIsLoading(true);
      const lastMessage = chatStore.getLastMessage();
      if (lastMessage) {
        lastMessage.loading = true;
      }

      // 获取更新后的消息列表，并过滤掉空内容的消息（只保留有效消息发送给API）
      const allMessages = chatStore.currentMessages();
      const messages = allMessages
        .filter((msg) => msg.content.trim() !== '') // 只发送有内容的消息
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
      if (lastMessage) {
        lastMessage.loading = false;
      }
    }
  };

  const handleRegenerate = async () => {
    try {
      const messages = currentMessages;
      if (messages.length < 2) return;

      const lastUserMessage = messages[messages.length - 2];
      // Remove last two messages
      messages.splice(-2, 2);
      chatStore.addMessage({
        ...messageHandler.formatMessage('user', lastUserMessage.content, '', lastUserMessage.files),
      });
      await handleSend({ text: lastUserMessage.content, files: lastUserMessage.files || [] });
    } catch (error) {
      console.error('Failed to regenerate message:', error);
    }
  };

  const handleNewChat = () => {
    chatStore.createConversation();
  };

  const formatTitle = (title: string) => {
    return title.length > 4 ? title.slice(0, 4) + '...' : title;
  };

  const openDialogEdit = (conversationId: string, type: 'edit' | 'delete') => {
    setDialogEditState({ visible: true, conversationId, type });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <PopupMenu onOpenDialogEdit={openDialogEdit} />
          <button className="new-chat-btn" onClick={handleNewChat}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            新对话
          </button>
          <div className="divider"></div>
          <div className="title-wrapper">
            <h1 className="chat-title">{formatTitle(currentConversation?.title || 'LLM Chat')}</h1>
            <button
              className="edit-btn"
              onClick={() => openDialogEdit(chatStore.currentConversationId, 'edit')}
            >
              <img src={editIcon} alt="edit" />
            </button>
          </div>
        </div>

        <div className="header-right">
          <button className="action-btn" onClick={() => setShowSettings(true)}>
            <img src={settingIcon} alt="settings" />
          </button>
          <button className="action-btn" onClick={() => navigate('/')}>
            <img src={backIcon} alt="back" />
          </button>
        </div>
      </div>

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

      {dialogEditState.visible && (
        <DialogEdit
          conversationId={dialogEditState.conversationId}
          type={dialogEditState.type}
          onClose={() => setDialogEditState({ ...dialogEditState, visible: false })}
        />
      )}
    </div>
  );
};

export default ChatView;
