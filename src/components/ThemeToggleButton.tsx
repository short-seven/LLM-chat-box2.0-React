import React, { useRef } from 'react';
import { useSettingStore } from '../stores/settingStore';
import './ThemeToggleButton.scss';

/**
 * 为什么用 SVG 而不是 emoji：
 * 🩷/🩵 是 Unicode 15.0 新增字符，部分浏览器/系统字体不支持会显示方框。
 * SVG 图标保证跨平台一致渲染。
 */

// 爱心图标 - 表示"点击切换到粉色主题"
const HeartIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

// 调色板图标 - 表示"点击切换回默认主题"
const PaletteIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="13.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="17.5" cy="10.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="8.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
    <circle cx="6.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

const ThemeToggleButton: React.FC = () => {
  const { theme, toggleTheme } = useSettingStore();
  const isPink = theme === 'pink';
  const btnRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    toggleTheme();
    // 爱心粒子效果（仅切换到粉色时）
    if (!isPink && btnRef.current) {
      spawnHearts(btnRef.current);
    }
  };

  return (
    <button
      ref={btnRef}
      className={`theme-toggle-btn ${isPink ? 'is-pink' : ''}`}
      onClick={handleClick}
      title={isPink ? '切换默认主题' : '切换少女粉色主题'}
    >
      {isPink ? <PaletteIcon /> : <HeartIcon />}
    </button>
  );
};

function spawnHearts(origin: HTMLElement) {
  const rect = origin.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 6; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '♥';
    const angle = (i / 6) * 360;
    const rad = (angle * Math.PI) / 180;
    const dist = 40 + Math.random() * 20;
    heart.style.cssText = `
      left: ${cx}px;
      top: ${cy}px;
      --dx: ${Math.cos(rad) * dist}px;
      --dy: ${Math.sin(rad) * dist - 30}px;
      animation-delay: ${i * 0.05}s;
    `;
    document.body.appendChild(heart);
    heart.addEventListener('animationend', () => heart.remove());
  }
}

export default ThemeToggleButton;
