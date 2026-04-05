import React, { useRef } from 'react';
import { useSettingStore } from '../stores/settingStore';
import './ThemeToggleButton.scss';

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
      <span className="theme-toggle-icon">{isPink ? '🩵' : '🩷'}</span>
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
