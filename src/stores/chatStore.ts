import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 用于生成唯一ID的计数器
let messageIdCounter = 0;

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
  files?: Array<{
    name: string;
    url: string;
    type: 'image' | 'file';
    size: number;
  }>;
  completion_tokens?: number;
  speed?: number;
  loading?: boolean;
  timestamp?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string;
  isLoading: boolean;
  currentConversation: () => Conversation | undefined;
  currentMessages: () => Message[];
  createConversation: () => void;
  switchConversation: (conversationId: string) => void;
  addMessage: (message: Partial<Message>) => void;
  setIsLoading: (value: boolean) => void;
  updateLastMessage: (
    content: string,
    reasoning_content?: string,
    completion_tokens?: number,
    speed?: number
  ) => void;
  getLastMessage: () => Message | null;
  updateConversationTitle: (conversationId: string, newTitle: string) => void;
  deleteConversation: (conversationId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [
        {
          id: '1',
          title: '日常问候',
          messages: [],
          createdAt: Date.now(),
        },
      ],
      currentConversationId: '1',
      isLoading: false,

      currentConversation: () => {
        const state = get();
        return state.conversations.find(
          (conv) => conv.id === state.currentConversationId
        );
      },

      currentMessages: () => {
        const conversation = get().currentConversation();
        return conversation?.messages || [];
      },

      createConversation: () => {
        const newConversation: Conversation = {
          id: Date.now().toString(),
          title: '日常问候',
          messages: [],
          createdAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
        }));
      },

      switchConversation: (conversationId: string) => {
        set({ currentConversationId: conversationId });
      },

      addMessage: (message: Partial<Message>) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === state.currentConversationId) {
              // 组合时间戳和递增计数器确保唯一性
              const id = Date.now() * 1000 + (messageIdCounter++ % 1000);
              return {
                ...conv,
                messages: [
                  ...conv.messages,
                  {
                    id,
                    timestamp: new Date().toISOString(),
                    ...message,
                  } as Message,
                ],
              };
            }
            return conv;
          });
          return { conversations };
        });
      },

      setIsLoading: (value: boolean) => {
        set({ isLoading: value });
      },

      updateLastMessage: (
        content: string,
        reasoning_content?: string,
        completion_tokens?: number,
        speed?: number
      ) => {
        set((state) => {
          const conversations = state.conversations.map((conv) => {
            if (conv.id === state.currentConversationId && conv.messages.length > 0) {
              const lastMessage = conv.messages[conv.messages.length - 1];
              return {
                ...conv,
                messages: [
                  ...conv.messages.slice(0, -1),
                  {
                    ...lastMessage,
                    content,
                    reasoning_content,
                    completion_tokens,
                    speed,
                  },
                ],
              };
            }
            return conv;
          });
          return { conversations };
        });
      },

      getLastMessage: () => {
        const conversation = get().currentConversation();
        if (conversation && conversation.messages.length > 0) {
          return conversation.messages[conversation.messages.length - 1];
        }
        return null;
      },

      updateConversationTitle: (conversationId: string, newTitle: string) => {
        set((state) => {
          const conversations = state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, title: newTitle } : conv
          );
          return { conversations };
        });
      },

      deleteConversation: (conversationId: string) => {
        set((state) => {
          let conversations = state.conversations.filter(
            (c) => c.id !== conversationId
          );

          // If no conversations left, create a new one
          if (conversations.length === 0) {
            const newConversation: Conversation = {
              id: Date.now().toString(),
              title: '日常问候',
              messages: [],
              createdAt: Date.now(),
            };
            conversations = [newConversation];
            return {
              conversations,
              currentConversationId: newConversation.id,
            };
          }

          // If deleted current conversation, switch to first one
          const newCurrentId =
            conversationId === state.currentConversationId
              ? conversations[0].id
              : state.currentConversationId;

          return {
            conversations,
            currentConversationId: newCurrentId,
          };
        });
      },
    }),
    {
      name: 'llm-chat',
      version: 1,
      migrate: (persistedState: any) => {
        // 修复旧数据中可能存在的重复ID
        if (persistedState && persistedState.conversations) {
          persistedState.conversations.forEach((conv: Conversation) => {
            if (conv.messages && conv.messages.length > 0) {
              // 重新分配所有消息的ID以确保唯一性
              const seenIds = new Set<number>();
              conv.messages.forEach((msg: Message, index: number) => {
                // 如果ID重复或无效，生成新的唯一ID
                if (seenIds.has(msg.id) || !msg.id) {
                  const newId = Date.now() * 1000 + (messageIdCounter++ % 1000) + index;
                  msg.id = newId;
                }
                seenIds.add(msg.id);
              });
            }
          });
        }
        return persistedState as ChatState;
      },
    }
  )
);
