import React, { useState, useRef, useEffect } from 'react';
import './AINewsButton.scss';

interface NewsItem {
  title: string;
  score: string;
  summary: string;
}

const AI_NEWS_URL = 'https://short-seven.github.io/AI-News/';
const RAW_BASE = 'https://raw.githubusercontent.com/short-seven/AI-News/main/docs/_posts/';

/**
 * 为什么用 GitHub Raw 而不是 API：
 * - Raw 无速率限制（公开仓库）
 * - 日更场景下直接按日期拼接 URL，不需要列目录
 */
function getRecentDateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 从 markdown 中提取第一条新闻的标题、评分和摘要
 */
function parseFirstNews(markdown: string): NewsItem | null {
  // 匹配 ### 1. 开头的标题行
  const titleMatch = markdown.match(/###\s*1\.\s*(.+)/);
  if (!titleMatch) return null;

  const title = titleMatch[0].replace(/^###\s*1\.\s*/, '').trim();

  // 提取评分
  const scoreMatch = markdown.match(/\*\*评分[：:]\s*(\d+\/10)\*\*/);
  const score = scoreMatch ? scoreMatch[1] : '';

  // 提取标题后面的第一段正文（跳过评分/来源行）
  const titleIndex = markdown.indexOf(titleMatch[0]);
  const afterTitle = markdown.slice(titleIndex + titleMatch[0].length);
  const lines = afterTitle.split('\n').filter(l => l.trim() !== '');

  // 找第一段非元信息的文字（不以 ** 开头，不以 > 开头，不是 ---）
  let summary = '';
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('**评分') || trimmed.startsWith('---') || trimmed.startsWith('>')) continue;
    if (trimmed.startsWith('**⚠') || trimmed.startsWith('**💡')) continue;
    // 纯文本段落
    if (trimmed.length > 20 && !trimmed.startsWith('#')) {
      summary = trimmed.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      break;
    }
  }

  // 截断到 120 字符
  if (summary.length > 120) {
    summary = summary.slice(0, 117) + '...';
  }

  return { title, score, summary };
}

const AINewsButton: React.FC = () => {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const fetchedRef = useRef(false);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchLatestNews = async () => {
    if (fetchedRef.current) return; // 只 fetch 一次
    fetchedRef.current = true;
    setLoading(true);
    setFetchError(false);

    // 尝试今天和最近 3 天的文件（可能还没生成今天的）
    for (let i = 1; i <= 4; i++) {
      const dateStr = getRecentDateStr(i);
      const url = `${RAW_BASE}${dateStr}-zh.md`;
      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          const parsed = parseFirstNews(text);
          if (parsed) {
            setNewsItem(parsed);
            setLoading(false);
            return;
          }
        }
      } catch {
        // 继续尝试前一天
      }
    }

    setFetchError(true);
    setLoading(false);
    fetchedRef.current = false; // 失败了允许重试
  };

  const handleMouseEnter = () => {
    hoverTimerRef.current = setTimeout(() => {
      setShowPopup(true);
      fetchLatestNews();
    }, 200); // 200ms 延迟避免快速划过误触
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setShowPopup(false);
  };

  const handleClick = () => {
    window.open(AI_NEWS_URL, '_blank');
  };

  // 清理 timer
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  return (
    <div
      className="ai-news-wrapper"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="ai-news-btn" onClick={handleClick} title="AI News - 每日 AI 新闻">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
          <line x1="10" y1="6" x2="18" y2="6" />
          <line x1="10" y1="10" x2="18" y2="10" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
        <span className="ai-news-btn-text">AI News</span>
      </button>

      {showPopup && (
        <div className="ai-news-popup">
          <div className="popup-header">
            <span className="popup-icon">📡</span>
            <span className="popup-title">今日 AI 头条</span>
          </div>
          <div className="popup-body">
            {loading && (
              <div className="popup-loading">
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
                <div className="loading-dot"></div>
              </div>
            )}
            {!loading && newsItem && (
              <>
                <h4 className="news-title">{newsItem.title}</h4>
                {newsItem.score && <span className="news-score">⭐ {newsItem.score}</span>}
                {newsItem.summary && <p className="news-summary">{newsItem.summary}</p>}
              </>
            )}
            {!loading && fetchError && (
              <p className="popup-error">暂无最新新闻，点击查看历史 →</p>
            )}
          </div>
          <div className="popup-footer">
            点击按钮查看全部 →
          </div>
        </div>
      )}
    </div>
  );
};

export default AINewsButton;
