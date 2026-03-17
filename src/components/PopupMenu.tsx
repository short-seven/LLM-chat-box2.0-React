import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../stores/chatStore';
import popupIcon from '../assets/photo/弹出框.png';
import dialogIcon from '../assets/photo/对话.png';
import editIcon from '../assets/photo/编辑.png';
import deleteIcon from '../assets/photo/删除.png';
import './PopupMenu.scss';

interface PopupMenuProps {
  onOpenDialogEdit: (conversationId: string, type: 'edit' | 'delete') => void;
}

const PopupMenu: React.FC<PopupMenuProps> = ({ onOpenDialogEdit }) => {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const chatStore = useChatStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNewChat = () => {
    chatStore.createConversation();
    setIsVisible(false);
  };

  const handleSwitchChat = (conversationId: string) => {
    chatStore.switchConversation(conversationId);
    setIsVisible(false);
  };

  const formatTitle = (title: string) => {
    return title.length > 4 ? title.slice(0, 4) + '...' : title;
  };

  return (
    <div className="popup-wrapper" ref={wrapperRef}>
      <button className="action-btn" onClick={() => setIsVisible(!isVisible)}>
        <img src={popupIcon} alt="menu" />
      </button>

      {isVisible && (
        <div className="popup-menu">
          <div className="menu-section">
            <button className="new-chat-btn" onClick={handleNewChat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              新对话
            </button>
          </div>
          <div className="divider"></div>
          <div className="menu-section">
            <div className="section-title">历史对话</div>
            <div className="history-list">
              {chatStore.conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`menu-item ${conversation.id === chatStore.currentConversationId ? 'active' : ''}`}
                  onClick={() => handleSwitchChat(conversation.id)}
                >
                  <div className="item-content">
                    <img src={dialogIcon} alt="dialog" />
                    <span title={conversation.title}>{formatTitle(conversation.title)}</span>
                  </div>
                  <div className="item-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDialogEdit(conversation.id, 'edit');
                      }}
                    >
                      <img src={editIcon} alt="edit" />
                    </button>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDialogEdit(conversation.id, 'delete');
                      }}
                    >
                      <img src={deleteIcon} alt="delete" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupMenu;
