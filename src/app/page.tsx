'use client';

import { useUIStore } from '@/lib/store';

export default function Home() {
  const { currentView } = useUIStore();

  return (
    <main className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar - To be implemented by Agent 2 */}
      <aside className="w-[var(--sidebar-width)] border-r border-[var(--border)] bg-[var(--background-secondary)]">
        <div className="p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-magenta)] bg-clip-text text-transparent">
            AI Playground
          </h1>
        </div>
        <div className="p-4 text-[var(--foreground-muted)]">
          <p className="text-sm">Sidebar component placeholder</p>
          <p className="text-xs mt-2">Current view: {currentView}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header - Mode Navigation */}
        <header className="h-[var(--header-height)] border-b border-[var(--border)] bg-[var(--background-secondary)] flex items-center px-4 gap-2">
          <ModeButton mode="chat" label="Chat" />
          <ModeButton mode="compare" label="Compare" />
          <ModeButton mode="search" label="Search" />
          <ModeButton mode="deepsearch" label="DeepSearch" />
          <ModeButton mode="knowledge" label="Knowledge" />
          <ModeButton mode="audio" label="Audio" />
          <ModeButton mode="spreadsheet" label="Spreadsheet" />
        </header>

        {/* Content Area */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 animate-slide-up">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center">
              <span className="text-3xl">🚀</span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              Welcome to AI Playground
            </h2>
            <p className="text-[var(--foreground-muted)] max-w-md">
              Foundation setup complete. Launch parallel agents to build features.
            </p>
            <div className="glass p-4 mt-6 text-left max-w-lg mx-auto">
              <h3 className="font-semibold text-[var(--accent-cyan)] mb-2">
                Next Steps:
              </h3>
              <ol className="text-sm text-[var(--foreground-muted)] space-y-1 list-decimal list-inside">
                <li>Commit this foundation to git</li>
                <li>Open 6 Cursor windows on this project</li>
                <li>Select &quot;Run in worktree&quot; for each agent</li>
                <li>Submit the agent prompts from the orchestration guide</li>
                <li>Apply completed agents to main branch</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ModeButton({ mode, label }: { mode: string; label: string }) {
  const { currentView, setCurrentView } = useUIStore();
  const isActive = currentView === mode;

  return (
    <button
      onClick={() => setCurrentView(mode as typeof currentView)}
      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
        isActive
          ? 'bg-[var(--accent-cyan)] text-[var(--background)] font-medium'
          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
      }`}
    >
      {label}
    </button>
  );
}
