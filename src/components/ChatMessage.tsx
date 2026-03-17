import React, { useState, useEffect } from 'react';
import { renderMarkdown } from '../utils/markdown';
import type { Message } from '../stores/chatStore';
import copyIcon from '../assets/photo/复制.png';
import successIcon from '../assets/photo/成功.png';
import likeIcon from '../assets/photo/赞.png';
import likeActiveIcon from '../assets/photo/赞2.png';
import dislikeIcon from '../assets/photo/踩.png';
import dislikeActiveIcon from '../assets/photo/踩2.png';
import regenerateIcon from '../assets/photo/重新生成.png';
import thinkingIcon from '../assets/photo/深度思考.png';
import loadingIcon from '../assets/photo/加载中.png';
import './ChatMessage.scss';

interface ChatMessageProps {
  message: Message;
  isLastAssistantMessage: boolean;
  onRegenerate: () => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastAssistantMessage, onRegenerate }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleLike = () => {
    if (isDisliked) setIsDisliked(false);
    setIsLiked(!isLiked);
  };

  const handleDislike = () => {
    if (isLiked) setIsLiked(false);
    setIsDisliked(!isDisliked);
  };

  const handleCodeCopy = async (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const codeBlock = target.closest('.code-block');
    const code = codeBlock?.querySelector('code')?.textContent;

    if (code) {
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  };

  const handleThemeToggle = (event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const codeBlock = target.closest('.code-block');
    const themeIcon = target.querySelector('img') as HTMLImageElement;
    const lightIcon = themeIcon.dataset.lightIcon;
    const darkIcon = themeIcon.dataset.darkIcon;

    if (codeBlock) {
      codeBlock.classList.toggle('dark-theme');
      if (themeIcon && lightIcon && darkIcon) {
        themeIcon.src = codeBlock.classList.contains('dark-theme') ? lightIcon : darkIcon;
      }
    }
  };

  useEffect(() => {
    const handleCodeActions = () => {
      const codeBlocks = document.querySelectorAll('.code-block');
      codeBlocks.forEach((block) => {
        const copyBtn = block.querySelector('[data-action="copy"]');
        const themeBtn = block.querySelector('[data-action="theme"]');

        if (copyBtn && !(copyBtn as any)._hasListener) {
          copyBtn.addEventListener('click', handleCodeCopy as any);
          (copyBtn as any)._hasListener = true;
        }
        if (themeBtn && !(themeBtn as any)._hasListener) {
          themeBtn.addEventListener('click', handleThemeToggle as any);
          (themeBtn as any)._hasListener = true;
        }
      });
    };

    handleCodeActions();

    const observer = new MutationObserver(handleCodeActions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      const codeBlocks = document.querySelectorAll('.code-block');
      codeBlocks.forEach((block) => {
        const copyBtn = block.querySelector('[data-action="copy"]');
        const themeBtn = block.querySelector('[data-action="theme"]');
        copyBtn?.removeEventListener('click', handleCodeCopy as any);
        themeBtn?.removeEventListener('click', handleThemeToggle as any);
      });
    };
  }, [message.content]);

  return (
    <div className={`message-item ${message.role === 'user' ? 'is-mine' : ''}`}>
      <div className="content">
        {message.files && message.files.length > 0 && (
          <div className="files-container">
            {message.files.map((file) => (
              <div key={file.url} className="file-item">
                {file.type === 'image' ? (
                  <div className="image-preview">
                    <img src={file.url} alt={file.name} />
                  </div>
                ) : (
                  <div className="file-preview">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(1)}KB</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {message.loading && message.role === 'assistant' && (
          <div className="thinking-text">
            <img src={loadingIcon} alt="loading" className="loading-icon" />
            <span>内容生成中...</span>
          </div>
        )}

        {message.reasoning_content && (
          <div className="reasoning-toggle" onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}>
            <img src={thinkingIcon} alt="thinking" />
            <span>深度思考</span>
            <svg
              className={`toggle-icon ${isReasoningExpanded ? 'is-expanded' : ''}`}
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}

        {message.reasoning_content && isReasoningExpanded && (
          <div
            className="reasoning markdown-body"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.reasoning_content) }}
          />
        )}

        <div className="bubble markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />

        {message.role === 'assistant' && !message.loading && (
          <div className="message-actions">
            {isLastAssistantMessage && (
              <button className="action-btn" onClick={onRegenerate} data-tooltip="重新生成">
                <img src={regenerateIcon} alt="regenerate" />
              </button>
            )}
            <button className="action-btn" onClick={handleCopy} data-tooltip="复制">
              <img src={isCopied ? successIcon : copyIcon} alt="copy" />
            </button>
            <button className="action-btn" onClick={handleLike} data-tooltip="喜欢">
              <img src={isLiked ? likeActiveIcon : likeIcon} alt="like" />
            </button>
            <button className="action-btn" onClick={handleDislike} data-tooltip="不喜欢">
              <img src={isDisliked ? dislikeActiveIcon : dislikeIcon} alt="dislike" />
            </button>

            {message.completion_tokens && (
              <span className="tokens-info">
                tokens: {message.completion_tokens}, speed: {message.speed} tokens/s
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
