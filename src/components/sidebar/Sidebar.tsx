import React from 'react';
import { useChatStore } from '../../stores/chatStore';
import ConversationList from './ConversationList';
import './Sidebar.scss';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { createConversation } = useChatStore();

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <span className="sidebar-logo">LLM Chat</span>}
        <button className="sidebar-toggle-btn" onClick={onToggle} title={collapsed ? '展开侧栏' : '收起侧栏'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            {collapsed ? (
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            ) : (
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            )}
          </svg>
        </button>
      </div>

      <div className="sidebar-new-chat">
        <button className="new-chat-btn" onClick={createConversation} title="新对话">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {!collapsed && <span>新对话</span>}
        </button>
      </div>

      {!collapsed && (
        <div className="sidebar-list">
          <ConversationList />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
