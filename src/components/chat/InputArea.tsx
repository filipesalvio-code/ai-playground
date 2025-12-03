'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  onSend: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({ onSend, disabled, placeholder }: InputAreaProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handleSend = () => {
    if (!content.trim() || disabled) return;
    onSend(content);
    setContent('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  return (
    <div className="relative">
      <div
        className={cn(
          'flex items-end gap-2 p-3 rounded-2xl border bg-[var(--background-secondary)] transition-all',
          disabled
            ? 'border-[var(--border)] opacity-60'
            : 'border-[var(--border)] focus-within:border-[var(--accent-cyan)] focus-within:shadow-[0_0_0_1px_var(--accent-cyan)]'
        )}
      >
        {/* Attachment button */}
        <button
          className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors"
          title="Attach file"
          disabled={disabled}
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Send a message...'}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 bg-transparent text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] resize-none focus:outline-none',
            'min-h-[24px] max-h-[200px] py-1.5'
          )}
        />

        {/* Voice button */}
        <button
          onClick={toggleRecording}
          className={cn(
            'p-2 rounded-lg transition-colors',
            isRecording
              ? 'text-[var(--error)] bg-[var(--error)]/10'
              : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--background-tertiary)]'
          )}
          title={isRecording ? 'Stop recording' : 'Voice input'}
          disabled={disabled}
        >
          {isRecording ? (
            <StopCircle className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Send button */}
        <Button
          onClick={handleSend}
          disabled={!content.trim() || disabled}
          size="icon"
          className={cn(
            'h-10 w-10 rounded-xl transition-all',
            content.trim() && !disabled
              ? 'bg-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/90'
              : 'bg-[var(--background-tertiary)] text-[var(--foreground-subtle)]'
          )}
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-[var(--foreground-subtle)]">
          Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">Enter</kbd> to send
        </p>
        {content.length > 0 && (
          <p className="text-xs text-[var(--foreground-subtle)]">
            {content.length} characters
          </p>
        )}
      </div>
    </div>
  );
}

