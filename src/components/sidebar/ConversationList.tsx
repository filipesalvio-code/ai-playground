'use client';

import { useConversationsStore, useUIStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';
import { getModel, providers } from '@/lib/models';
import { MessageSquare, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';

export function ConversationList() {
  const { conversations, currentConversationId, setCurrentConversation, deleteConversation } = 
    useConversationsStore();
  const { setCurrentView } = useUIStore();

  const handleSelect = (id: string) => {
    setCurrentConversation(id);
    setCurrentView('chat');
  };

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <MessageSquare className="w-8 h-8 mx-auto text-[var(--foreground-subtle)] mb-2" />
        <p className="text-sm text-[var(--foreground-muted)]">No conversations yet</p>
        <p className="text-xs text-[var(--foreground-subtle)] mt-1">
          Start a new chat to begin
        </p>
      </div>
    );
  }

  // Group conversations by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: { label: string; items: typeof conversations }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Last 7 days', items: [] },
    { label: 'Older', items: [] },
  ];

  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    if (date >= today) {
      groups[0].items.push(conv);
    } else if (date >= yesterday) {
      groups[1].items.push(conv);
    } else if (date >= lastWeek) {
      groups[2].items.push(conv);
    } else {
      groups[3].items.push(conv);
    }
  });

  return (
    <div className="px-2">
      {groups.map(
        (group) =>
          group.items.length > 0 && (
            <div key={group.label} className="mb-4">
              <h3 className="px-2 py-1 text-xs font-medium text-[var(--foreground-subtle)] uppercase tracking-wider">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={conv.id === currentConversationId}
                    onSelect={() => handleSelect(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                  />
                ))}
              </div>
            </div>
          )
      )}
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: {
  conversation: {
    id: string;
    title: string;
    model: string;
    updatedAt: number;
    messages: { role: string }[];
  };
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const model = getModel(conversation.model);
  const provider = model?.provider ? providers[model.provider] : null;

  return (
    <div
      className={cn(
        'group relative flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
        isActive
          ? 'bg-[var(--background-tertiary)]'
          : 'hover:bg-[var(--background-tertiary)]/50'
      )}
      onClick={onSelect}
    >
      {/* Provider indicator */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: provider?.color || 'var(--foreground-subtle)' }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] truncate">
          {conversation.title}
        </p>
        <p className="text-xs text-[var(--foreground-subtle)] truncate">
          {model?.name || conversation.model} · {conversation.messages.length} messages
        </p>
      </div>

      {/* Actions */}
      <div
        className={cn(
          'flex items-center gap-1 transition-opacity',
          showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded hover:bg-[var(--border)] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4 text-[var(--foreground-muted)]" />
        </button>
      </div>

      {/* Dropdown menu */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
            }}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-lg py-1 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMenu(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-[var(--error)] hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

