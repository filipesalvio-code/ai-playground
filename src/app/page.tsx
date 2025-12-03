'use client';

import { useEffect } from 'react';
import { useUIStore, useConversationsStore } from '@/lib/store';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { ChatContainer } from '@/components/chat/ChatContainer';
import { KnowledgeBase } from '@/components/rag/KnowledgeBase';
import { AudioPanel } from '@/components/audio/AudioPanel';
import { DeepSearchPanel } from '@/components/deepsearch/DeepSearchPanel';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  GitCompare, 
  Search, 
  Brain, 
  Database, 
  Mic, 
  FileSpreadsheet 
} from 'lucide-react';

export default function Home() {
  const { currentView, setCurrentView, sidebarOpen, selectedModel } = useUIStore();
  const { conversations, currentConversationId, createConversation } = useConversationsStore();

  // Create a conversation if none exists when view is chat
  useEffect(() => {
    if (currentView === 'chat' && !currentConversationId && conversations.length === 0) {
      createConversation(selectedModel);
    }
  }, [currentView, currentConversationId, conversations.length, createConversation, selectedModel]);

  return (
    <main className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarOpen ? 'ml-[var(--sidebar-width)]' : 'ml-0'
        )}
      >
        {/* Mode Navigation */}
        <header className="h-[var(--header-height)] border-b border-[var(--border)] bg-[var(--background-secondary)]/80 backdrop-blur-sm flex items-center px-4 gap-1 sticky top-0 z-30">
          <ModeButton 
            mode="chat" 
            label="Chat" 
            icon={<MessageSquare className="w-4 h-4" />}
            active={currentView === 'chat'}
            onClick={() => setCurrentView('chat')}
          />
          <ModeButton 
            mode="compare" 
            label="Compare" 
            icon={<GitCompare className="w-4 h-4" />}
            active={currentView === 'compare'}
            onClick={() => setCurrentView('compare')}
          />
          <ModeButton 
            mode="search" 
            label="Search" 
            icon={<Search className="w-4 h-4" />}
            active={currentView === 'search'}
            onClick={() => setCurrentView('search')}
          />
          <ModeButton 
            mode="deepsearch" 
            label="DeepSearch" 
            icon={<Brain className="w-4 h-4" />}
            active={currentView === 'deepsearch'}
            onClick={() => setCurrentView('deepsearch')}
          />
          <ModeButton 
            mode="knowledge" 
            label="Knowledge" 
            icon={<Database className="w-4 h-4" />}
            active={currentView === 'knowledge'}
            onClick={() => setCurrentView('knowledge')}
          />
          <ModeButton 
            mode="audio" 
            label="Audio" 
            icon={<Mic className="w-4 h-4" />}
            active={currentView === 'audio'}
            onClick={() => setCurrentView('audio')}
          />
          <ModeButton 
            mode="spreadsheet" 
            label="Spreadsheet" 
            icon={<FileSpreadsheet className="w-4 h-4" />}
            active={currentView === 'spreadsheet'}
            onClick={() => setCurrentView('spreadsheet')}
          />
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'chat' && <ChatContainer />}
          {currentView === 'compare' && <ComingSoon title="Model Comparison" description="Compare responses from multiple AI models side by side" />}
          {currentView === 'search' && <ComingSoon title="Web Search" description="Search the web with Perplexity-powered AI" />}
          {currentView === 'deepsearch' && <DeepSearchPanel />}
          {currentView === 'knowledge' && <KnowledgeBase />}
          {currentView === 'audio' && <AudioPanel />}
          {currentView === 'spreadsheet' && <ComingSoon title="Spreadsheet" description="Create and export Excel and Google Sheets" />}
        </div>
      </div>
    </main>
  );
}

function ModeButton({
  mode,
  label,
  icon,
  active,
  onClick,
}: {
  mode: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all',
        active
          ? 'bg-[var(--accent-cyan)] text-[var(--background)] font-medium'
          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-magenta)]/20 flex items-center justify-center mb-4 border border-[var(--border)]">
        <span className="text-3xl">🚀</span>
      </div>
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h2>
      <p className="text-[var(--foreground-muted)] max-w-md mb-4">
        {description}
      </p>
      <p className="text-sm text-[var(--foreground-subtle)]">
        Coming soon to AI Playground
      </p>
    </div>
  );
}
