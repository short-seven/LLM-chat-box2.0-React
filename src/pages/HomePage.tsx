import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchDialog from '../components/SearchDialog';
import githubIcon from '../assets/photo/github.png';
import './HomePage.scss';

const HomePage: React.FC = () => {
  const [showSearchDialog, setShowSearchDialog] = useState(false);

  const handleSearchClick = () => {
    setShowSearchDialog(true);
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains('search-dialog-overlay')) {
      setShowSearchDialog(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchDialog = document.querySelector('.search-dialog');
      const target = event.target as HTMLElement;
      if (
        searchDialog &&
        !searchDialog.contains(target) &&
        !target.closest('.search-container')
      ) {
        setShowSearchDialog(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearchDialog(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setShowSearchDialog(true);
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, []);

  return (
    <div className="home-page">
      <header className="header">
        <div className="header-left">
          <span className="logo-text">LLM Chat</span>
        </div>
        <div className="header-right">
          <div className="search-container" onClick={handleSearchClick}>
            <div className="search-input">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input type="text" placeholder="搜索" readOnly value="" />
              <div className="shortcut-key">⌘ K</div>
            </div>
          </div>
          <a href="https://github.com/short-seven/LLM-chat-box2.0-React" target="_blank" className="github-link">
            <img src={githubIcon} alt="GitHub" className="github-icon" />
          </a>
        </div>
      </header>

      <main className="main-content">
        <div className="hero-section">
          <h1 className="title">欢迎使用 LLM Chat</h1>
          <p className="description">一个强大的 AI 聊天助手，基于大语言模型，为您提供智能对话体验</p>
          <div className="features">
            <div className="feature-item">
              <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>智能对话</h3>
              <p>自然流畅的对话体验，理解上下文</p>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>文件支持</h3>
              <p>支持多种格式文件上传，增强信息输入</p>
              <p className="note">注意：由于接口限制，后台无法读取到文件内容</p>
            </div>
            <div className="feature-item">
              <svg className="feature-icon" width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3>个性化设置</h3>
              <p>可自定义的对话参数，满足不同场景需求</p>
              <p className="note" style={{ color: '#3f7af1' }}>支持 deepseek_r1 模型</p>
            </div>
          </div>
          <Link to="/chat" className="start-button">
            <span className="mirror-text">开始对话</span>
            <div className="liquid"></div>
          </Link>
        </div>
      </main>

      {showSearchDialog && (
        <div className="search-dialog-overlay" onClick={handleOverlayClick}>
          <div className="search-dialog-container" onClick={(e) => e.stopPropagation()}>
            <SearchDialog />
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
