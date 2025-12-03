'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import { getModel, providers } from '@/lib/models';
import { cn, copyToClipboard } from '@/lib/utils';
import { User, Copy, Check, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
  isLatest?: boolean;
}

export function MessageBubble({ message, isLatest }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const model = message.model ? getModel(message.model) : null;
  const provider = model?.provider ? providers[model.provider] : null;

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        'group flex gap-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          isUser
            ? 'bg-[var(--accent-cyan)] text-[var(--background)]'
            : 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
        )}
        style={
          !isUser && provider
            ? { backgroundColor: provider.color + '20', color: provider.color }
            : undefined
        }
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          provider?.icon || '◯'
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 max-w-[85%] space-y-1',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* Header */}
        {!isUser && model && (
          <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
            <span style={{ color: provider?.color }}>{model.name}</span>
            {message.isStreaming && (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
                Thinking...
              </span>
            )}
          </div>
        )}

        {/* Message content */}
        <div
          className={cn(
            'rounded-2xl px-4 py-3',
            isUser
              ? 'bg-[var(--accent-cyan)] text-[var(--background)] rounded-br-md'
              : 'bg-[var(--background-secondary)] text-[var(--foreground)] rounded-bl-md border border-[var(--border)]'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-content prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    
                    if (isInline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] text-[var(--accent-cyan)] text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative group/code my-3">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--background-tertiary)] rounded-t-lg border border-b-0 border-[var(--border)]">
                          <span className="text-xs text-[var(--foreground-muted)]">
                            {match[1]}
                          </span>
                          <button
                            onClick={() => copyToClipboard(String(children))}
                            className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <pre className="!mt-0 !rounded-t-none overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      </div>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--accent-cyan)] hover:underline"
                      >
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {message.content || (message.isStreaming ? '...' : '')}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          className={cn(
            'flex items-center gap-2 transition-opacity',
            'opacity-0 group-hover:opacity-100'
          )}
        >
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[var(--background-tertiary)] transition-colors"
            title="Copy message"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[var(--success)]" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            )}
          </button>
          {!isUser && (
            <button
              className="p-1 rounded hover:bg-[var(--background-tertiary)] transition-colors"
              title="Regenerate"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--foreground-muted)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

