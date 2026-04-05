import React, { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../../stores/chatStore';
import { useNavigate } from 'react-router-dom';
import ThemeToggleButton from '../ThemeToggleButton';
import settingIcon from '../../assets/photo/设置.png';
import editIcon from '../../assets/photo/编辑.png';
import './TopBar.scss';

interface TopBarProps {
  onOpenSettings: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onOpenSettings }) => {
  const navigate = useNavigate();
  const { currentConversation, currentConversationId, updateConversationTitle } = useChatStore();
  const conv = currentConversation();

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEditStart = () => {
    setEditValue(conv?.title ?? '');
    setIsEditing(true);
  };

  const handleEditSubmit = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== conv?.title) {
      updateConversationTitle(currentConversationId, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleEditSubmit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  return (
    <div className="topbar">
      <div className="topbar-left">
        {isEditing ? (
          <input
            ref={inputRef}
            className="topbar-title-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditSubmit}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <div className="topbar-title-wrapper" onClick={handleEditStart}>
            <h1 className="topbar-title">{conv?.title ?? 'LLM Chat'}</h1>
            <span className="topbar-edit-hint">
              <img src={editIcon} alt="edit" width={12} height={12} />
            </span>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <ThemeToggleButton />
        <button className="topbar-btn" onClick={onOpenSettings} title="设置">
          <img src={settingIcon} alt="settings" />
        </button>
        <button className="topbar-btn" onClick={() => navigate('/')} title="返回首页">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TopBar;
