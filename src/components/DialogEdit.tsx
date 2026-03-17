import React, { useState, useEffect } from 'react';
import { useChatStore } from '../stores/chatStore';
import './DialogEdit.scss';

interface DialogEditProps {
  conversationId: string;
  type: 'edit' | 'delete';
  onClose: () => void;
}

const DialogEdit: React.FC<DialogEditProps> = ({ conversationId, type, onClose }) => {
  const chatStore = useChatStore();
  const [inputTitle, setInputTitle] = useState('');

  useEffect(() => {
    if (type === 'edit') {
      const conversation = chatStore.conversations.find((c) => c.id === conversationId);
      setInputTitle(conversation?.title || '');
    }
  }, [conversationId, type, chatStore.conversations]);

  const handleConfirm = () => {
    if (type === 'edit') {
      if (!inputTitle.trim()) return;
      chatStore.updateConversationTitle(conversationId, inputTitle.trim());
    } else {
      chatStore.deleteConversation(conversationId);
    }
    onClose();
  };

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h3>{type === 'edit' ? '编辑对话名称' : '确定删除对话?'}</h3>
        </div>

        <div className="dialog-body">
          {type === 'edit' ? (
            <input
              type="text"
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              placeholder="请输入对话名称"
              maxLength={50}
            />
          ) : (
            <div className="delete-warning">
              <svg className="warning-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>删除后，聊天记录将不可恢复。</span>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn btn-cancel" onClick={onClose}>
            取消
          </button>
          <button className={`btn ${type === 'edit' ? 'btn-primary' : 'btn-danger'}`} onClick={handleConfirm}>
            {type === 'edit' ? '确定' : '删除'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DialogEdit;
