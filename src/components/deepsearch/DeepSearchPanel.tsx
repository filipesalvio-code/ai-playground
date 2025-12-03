'use client';

import { useState } from 'react';
import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ResearchReport } from './ResearchReport';
import { cn } from '@/lib/utils';
import type { DeepSearchQuery } from '@/lib/types';
import { 
  Brain, 
  Search, 
  Loader2,
  Sparkles,
  BookOpen
} from 'lucide-react';

export function DeepSearchPanel() {
  const [question, setQuestion] = useState('');
  const [isResearching, setIsResearching] = useState(false);
  const { deepSearchQuery, setDeepSearchQuery } = useUIStore();

  const handleSubmit = async () => {
    if (!question.trim() || isResearching) return;

    setIsResearching(true);
    setDeepSearchQuery({
      question: question.trim(),
      status: 'pending',
    });

    try {
      // Use SSE for real-time updates
      const eventSource = new EventSource(
        `/api/deepsearch?question=${encodeURIComponent(question.trim())}`
      );

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close();
          setIsResearching(false);
          return;
        }

        try {
          const update = JSON.parse(event.data);
          setDeepSearchQuery((prev) => prev ? { ...prev, ...update } : update);
        } catch {
          // Ignore parse errors
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsResearching(false);
        setDeepSearchQuery((prev) => prev ? { ...prev, status: 'error' } : null);
      };
    } catch (error) {
      console.error('DeepSearch error:', error);
      setIsResearching(false);
      setDeepSearchQuery((prev) => prev ? { ...prev, status: 'error' } : null);
    }
  };

  const handleNewSearch = () => {
    setDeepSearchQuery(null);
    setQuestion('');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-5 h-5 text-[var(--accent-magenta)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            DeepSearch
          </h2>
        </div>
        <p className="text-sm text-[var(--foreground-muted)]">
          Multi-step AI research that breaks down your question, searches multiple sources, and synthesizes a comprehensive answer.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!deepSearchQuery ? (
          // Input state
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--foreground)]">
                Research Question
              </label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter a complex question that requires in-depth research..."
                className="min-h-[120px]"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!question.trim() || isResearching}
              className="w-full"
            >
              {isResearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Researching...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Start Research
                </>
              )}
            </Button>

            {/* Example questions */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-[var(--foreground-muted)]">
                Example questions:
              </p>
              <div className="space-y-2">
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setQuestion(q)}
                    className="w-full text-left p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                  >
                    <p className="text-sm text-[var(--foreground)]">{q}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Research in progress or complete
          <div className="p-4">
            {/* Progress indicators */}
            {deepSearchQuery.status !== 'complete' && deepSearchQuery.status !== 'error' && (
              <div className="mb-6 space-y-4">
                <ProgressStep
                  label="Breaking down question"
                  status={deepSearchQuery.subQuestions?.length ? 'complete' : 'loading'}
                />
                <ProgressStep
                  label="Searching sources"
                  status={
                    deepSearchQuery.status === 'searching' && deepSearchQuery.searchResults?.length
                      ? 'loading'
                      : deepSearchQuery.searchResults?.length
                      ? 'complete'
                      : 'pending'
                  }
                  detail={
                    deepSearchQuery.searchResults?.length
                      ? `${deepSearchQuery.searchResults.length} of ${deepSearchQuery.subQuestions?.length || '?'} complete`
                      : undefined
                  }
                />
                <ProgressStep
                  label="Synthesizing results"
                  status={deepSearchQuery.status === 'synthesizing' ? 'loading' : 'pending'}
                />
              </div>
            )}

            {/* Sub-questions */}
            {deepSearchQuery.subQuestions && deepSearchQuery.subQuestions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-[var(--foreground)] mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--accent-cyan)]" />
                  Sub-questions being researched
                </h3>
                <div className="space-y-2">
                  {deepSearchQuery.subQuestions.map((q, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex items-start gap-2 p-2 rounded-lg text-sm',
                        deepSearchQuery.searchResults?.[i]
                          ? 'bg-[var(--success)]/10 text-[var(--foreground)]'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                      )}
                    >
                      <span className="font-mono text-xs mt-0.5">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            {deepSearchQuery.synthesis && (
              <ResearchReport query={deepSearchQuery} onNewSearch={handleNewSearch} />
            )}

            {/* Error state */}
            {deepSearchQuery.status === 'error' && (
              <div className="text-center py-8">
                <p className="text-[var(--error)] mb-4">Research failed. Please try again.</p>
                <Button onClick={handleNewSearch}>Start New Research</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProgressStep({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'pending' | 'loading' | 'complete';
  detail?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'w-6 h-6 rounded-full flex items-center justify-center',
          status === 'complete' && 'bg-[var(--success)]',
          status === 'loading' && 'bg-[var(--accent-cyan)]',
          status === 'pending' && 'bg-[var(--background-tertiary)]'
        )}
      >
        {status === 'loading' ? (
          <Loader2 className="w-4 h-4 text-white animate-spin" />
        ) : status === 'complete' ? (
          <BookOpen className="w-3 h-3 text-white" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-[var(--foreground-subtle)]" />
        )}
      </div>
      <div>
        <p className={cn(
          'text-sm font-medium',
          status === 'pending' ? 'text-[var(--foreground-muted)]' : 'text-[var(--foreground)]'
        )}>
          {label}
        </p>
        {detail && (
          <p className="text-xs text-[var(--foreground-muted)]">{detail}</p>
        )}
      </div>
    </div>
  );
}

const EXAMPLE_QUESTIONS = [
  "What are the latest advances in quantum computing and their potential impact on cryptography?",
  "How is AI being used in drug discovery and what are the most promising developments?",
  "What are the economic implications of central bank digital currencies (CBDCs)?",
];

