import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const defaultApiKey = import.meta.env.VITE_SILICONFLOW_API_KEY?.trim() ?? '';

export interface ModelOption {
  label: string;
  value: string;
  maxTokens: number;
}

export const modelOptions: ModelOption[] = [
  {
    label: 'DeepSeek-R1',
    value: 'deepseek-ai/DeepSeek-R1',
    maxTokens: 16384,
  },
  {
    label: 'DeepSeek-V3',
    value: 'deepseek-ai/DeepSeek-V3',
    maxTokens: 4096,
  },
  {
    label: 'DeepSeek-V2.5',
    value: 'deepseek-ai/DeepSeek-V2.5',
    maxTokens: 4096,
  },
  {
    label: 'Qwen2.5-72B-Instruct-128K',
    value: 'Qwen/Qwen2.5-72B-Instruct-128K',
    maxTokens: 4096,
  },
  {
    label: 'QwQ-32B-Preview',
    value: 'Qwen/QwQ-32B-Preview',
    maxTokens: 8192,
  },
  {
    label: 'glm-4-9b-chat',
    value: 'THUDM/glm-4-9b-chat',
    maxTokens: 4096,
  },
  {
    label: 'glm-4-9b-chat(Pro)',
    value: 'Pro/THUDM/glm-4-9b-chat',
    maxTokens: 4096,
  },
];

export interface Settings {
  model: string;
  apiKey: string;
  stream: boolean;
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
}

interface SettingState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const useSettingStore = create<SettingState>()(
  persist(
    (set) => ({
      settings: {
        model: 'deepseek-ai/DeepSeek-R1',
        apiKey: defaultApiKey,
        stream: true,
        maxTokens: 4096,
        temperature: 0.7,
        topP: 0.7,
        topK: 50,
      },
      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
    }),
    {
      name: 'llm-setting',
    }
  )
);
