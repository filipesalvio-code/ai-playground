'use client';

import { useEffect, useRef } from 'react';
import { useConversationsStore, useUIStore } from '@/lib/store';
import { MessageBubble } from './MessageBubble';
import { InputArea } from './InputArea';
import { ModelSelector } from './ModelSelector';
import { MessageSquare, Sparkles } from 'lucide-react';

export function ChatContainer() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { conversations, currentConversationId, addMessage, updateMessage, getCurrentConversation } = 
    useConversationsStore();
  const { selectedModel } = useUIStore();
  
  const conversation = getCurrentConversation();
  const messages = conversation?.messages || [];

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversationId || !content.trim()) return;

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: content.trim(),
      timestamp: Date.now(),
    };
    addMessage(currentConversationId, userMessage);

    // Add placeholder assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant' as const,
      content: '',
      model: selectedModel,
      timestamp: Date.now(),
      isStreaming: true,
    };
    addMessage(currentConversationId, assistantMessage);

    try {
      // Get updated messages including the new user message
      const currentMessages = [
        ...messages,
        userMessage,
      ];

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          messages: currentMessages,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        
        // Update message with accumulated content
        updateMessage(currentConversationId, assistantMessageId, fullContent);
      }
    } catch (error) {
      console.error('Chat error:', error);
      updateMessage(
        currentConversationId,
        assistantMessageId,
        'Sorry, there was an error processing your request. Please check your API key and try again.'
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background-secondary)]/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[var(--accent-cyan)]" />
          <span className="font-medium text-[var(--foreground)]">
            {conversation?.title || 'New Chat'}
          </span>
        </div>
        <ModelSelector />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto p-4">
          <InputArea 
            onSend={handleSendMessage} 
            disabled={!currentConversationId}
            placeholder={
              currentConversationId 
                ? "Send a message..." 
                : "Create a new chat to start"
            }
          />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-magenta)] flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
        How can I help you today?
      </h2>
      <p className="text-[var(--foreground-muted)] max-w-md mb-6">
        Ask me anything! I can help with coding, writing, analysis, research, and much more.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        <SuggestionCard 
          title="Write code"
          description="Help me build a React component"
        />
        <SuggestionCard 
          title="Explain concept"
          description="How does machine learning work?"
        />
        <SuggestionCard 
          title="Analyze data"
          description="Summarize this document for me"
        />
        <SuggestionCard 
          title="Creative writing"
          description="Write a short story about..."
        />
      </div>
    </div>
  );
}

function SuggestionCard({ title, description }: { title: string; description: string }) {
  return (
    <button className="p-3 text-left rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] hover:border-[var(--border-light)] transition-colors">
      <p className="font-medium text-sm text-[var(--foreground)]">{title}</p>
      <p className="text-xs text-[var(--foreground-muted)] mt-1">{description}</p>
    </button>
  );
}

