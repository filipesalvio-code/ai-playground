'use client';

import { useUIStore, useConversationsStore } from '@/lib/store';
import { ConversationList } from './ConversationList';
import { Button } from '@/components/ui/button';
import { 
  PanelLeftClose, 
  PanelLeft, 
  Plus, 
  Settings,
  Database,
  Mic,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, currentView, setCurrentView } = useUIStore();
  const { createConversation } = useConversationsStore();
  const selectedModel = useUIStore((state) => state.selectedModel);

  const handleNewChat = () => {
    createConversation(selectedModel);
    setCurrentView('chat');
  };

  return (
    <>
      {/* Collapsed sidebar toggle */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:bg-[var(--background-tertiary)] transition-colors"
        >
          <PanelLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full bg-[var(--background-secondary)] border-r border-[var(--border)] transition-all duration-300 z-40 flex flex-col',
          sidebarOpen ? 'w-[var(--sidebar-width)]' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <h1 className="text-lg font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-magenta)] bg-clip-text text-transparent">
            AI Playground
          </h1>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <PanelLeftClose className="w-5 h-5 text-[var(--foreground-muted)]" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={handleNewChat}
            variant="outline"
            className="w-full justify-start gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList />
        </div>

        {/* Quick Actions */}
        <div className="p-3 border-t border-[var(--border)] space-y-1">
          <QuickAction
            icon={<Database className="w-4 h-4" />}
            label="Knowledge Base"
            active={currentView === 'knowledge'}
            onClick={() => setCurrentView('knowledge')}
          />
          <QuickAction
            icon={<Mic className="w-4 h-4" />}
            label="Audio & Transcription"
            active={currentView === 'audio'}
            onClick={() => setCurrentView('audio')}
          />
          <QuickAction
            icon={<FileSpreadsheet className="w-4 h-4" />}
            label="Spreadsheet"
            active={currentView === 'spreadsheet'}
            onClick={() => setCurrentView('spreadsheet')}
          />
        </div>

        {/* Settings */}
        <div className="p-3 border-t border-[var(--border)]">
          <button className="flex items-center gap-2 w-full p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors text-sm">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </aside>
    </>
  );
}

function QuickAction({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full p-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

