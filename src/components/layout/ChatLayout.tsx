import React, { useState } from 'react';
import Sidebar from '../sidebar/Sidebar';
import './ChatLayout.scss';

interface ChatLayoutProps {
  children: React.ReactNode;
  topBar?: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ children, topBar }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="chat-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <div className="chat-layout-main">
        {topBar && <div className="chat-layout-topbar">{topBar}</div>}
        <div className="chat-layout-content">{children}</div>
      </div>
    </div>
  );
};

export default ChatLayout;
