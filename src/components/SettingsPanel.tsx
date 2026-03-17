import React, { useState, useEffect } from 'react';
import { useSettingStore, modelOptions } from '../stores/settingStore';
import './SettingsPanel.scss';

interface SettingsPanelProps {
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ onClose }) => {
  const settingStore = useSettingStore();
  const [settings, setSettings] = useState(settingStore.settings);

  const currentMaxTokens =
    modelOptions.find((option) => option.value === settings.model)?.maxTokens || 4096;

  useEffect(() => {
    const selectedModel = modelOptions.find((option) => option.value === settings.model);
    if (selectedModel) {
      const newMaxTokens = Math.min(settings.maxTokens, selectedModel.maxTokens);
      if (newMaxTokens !== settings.maxTokens) {
        setSettings({ ...settings, maxTokens: newMaxTokens });
      }
    }
  }, [settings.model]);

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    settingStore.updateSettings(newSettings);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>设置</h2>
          <button className="close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="settings-container">
          <div className="setting-item">
            <div className="setting-label">Model</div>
            <select
              className="model-select"
              value={settings.model}
              onChange={(e) => handleChange('model', e.target.value)}
            >
              {modelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-label-row">
              <div className="label-with-tooltip">
                <span>流式响应</span>
                <span className="tooltip-icon" title="开启后将流式响应 AI 的回复">?</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={settings.stream}
                  onChange={(e) => handleChange('stream', e.target.checked)}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label-row">
              <div className="label-with-tooltip">
                <span>API Key</span>
                <span className="tooltip-icon" title="设置 API Key">?</span>
              </div>
              <a href="https://cloud.siliconflow.cn/account/ak" target="_blank" className="get-key-link">
                获取 API Key
              </a>
            </div>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => handleChange('apiKey', e.target.value)}
              placeholder="请输入 API Key"
            />
          </div>

          <div className="setting-item">
            <div className="setting-label">
              Max Tokens
              <span className="tooltip-icon" title="生成文本的最大长度">?</span>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="setting-slider"
                min="1"
                max={currentMaxTokens}
                step="1"
                value={settings.maxTokens}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              />
              <input
                type="number"
                className="number-input"
                min="1"
                max={currentMaxTokens}
                value={settings.maxTokens}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              Temperature
              <span className="tooltip-icon" title="值越高,回答越随机">?</span>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="setting-slider"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
              <input
                type="number"
                className="number-input"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              Top-P
              <span className="tooltip-icon" title="核采样阈值">?</span>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="setting-slider"
                min="0"
                max="1"
                step="0.1"
                value={settings.topP}
                onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
              />
              <input
                type="number"
                className="number-input"
                min="0"
                max="1"
                step="0.1"
                value={settings.topP}
                onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              Top-K
              <span className="tooltip-icon" title="保留概率最高的 K 个词">?</span>
            </div>
            <div className="setting-control">
              <input
                type="range"
                className="setting-slider"
                min="1"
                max="100"
                step="1"
                value={settings.topK}
                onChange={(e) => handleChange('topK', parseInt(e.target.value))}
              />
              <input
                type="number"
                className="number-input"
                min="1"
                max="100"
                step="1"
                value={settings.topK}
                onChange={(e) => handleChange('topK', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
