import React, { useMemo } from 'react';
import { useChatStore } from '../../stores/chatStore';
import type { Conversation } from '../../stores/chatStore';
import ConversationItem from './ConversationItem';
import './ConversationList.scss';

const groupConversations = (conversations: Conversation[]) => {
  const now = Date.now();
  const oneDay = 86400000;
  const sevenDays = 7 * oneDay;
  const thirtyDays = 30 * oneDay;

  const groups: { label: string; items: Conversation[] }[] = [
    { label: '今天', items: [] },
    { label: '过去 7 天', items: [] },
    { label: '过去 30 天', items: [] },
    { label: '更早', items: [] },
  ];

  conversations.forEach((conv) => {
    const age = now - conv.createdAt;
    if (age < oneDay) groups[0].items.push(conv);
    else if (age < sevenDays) groups[1].items.push(conv);
    else if (age < thirtyDays) groups[2].items.push(conv);
    else groups[3].items.push(conv);
  });

  return groups.filter((g) => g.items.length > 0);
};

const ConversationList: React.FC = () => {
  const { conversations, currentConversationId, switchConversation } = useChatStore();
  const groups = useMemo(() => groupConversations(conversations), [conversations]);

  if (conversations.length === 0) {
    return (
      <div className="conv-list-empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p>暂无对话</p>
      </div>
    );
  }

  return (
    <div className="conv-list">
      {groups.map((group) => (
        <div key={group.label} className="conv-group">
          <div className="conv-group-label">{group.label}</div>
          {group.items.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === currentConversationId}
              onClick={() => switchConversation(conv.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
