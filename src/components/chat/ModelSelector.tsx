'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/lib/store';
import { models, providers, getModel } from '@/lib/models';
import type { Provider } from '@/lib/types';
import { ChevronDown, Check, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedModel, setSelectedModel } = useUIStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentModel = getModel(selectedModel);
  const currentProvider = currentModel?.provider ? providers[currentModel.provider] : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group models by provider
  const modelsByProvider = models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<Provider, typeof models>);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          'bg-[var(--background-secondary)] border-[var(--border)]',
          'hover:border-[var(--border-light)]',
          isOpen && 'border-[var(--accent-cyan)]'
        )}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: currentProvider?.color || 'var(--foreground-subtle)' }}
        />
        <span className="text-sm text-[var(--foreground)]">
          {currentModel?.name || 'Select model'}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-[var(--foreground-muted)] transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl shadow-lg z-50 overflow-hidden animate-slide-up">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {(Object.entries(modelsByProvider) as [Provider, typeof models][]).map(
              ([provider, providerModels]) => (
                <div key={provider} className="mb-2 last:mb-0">
                  {/* Provider header */}
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <span
                      className="text-lg"
                      style={{ color: providers[provider].color }}
                    >
                      {providers[provider].icon}
                    </span>
                    <span className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">
                      {providers[provider].name}
                    </span>
                  </div>

                  {/* Models */}
                  <div className="space-y-0.5">
                    {providerModels.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
                          model.id === selectedModel
                            ? 'bg-[var(--accent-cyan)]/10'
                            : 'hover:bg-[var(--background-tertiary)]'
                        )}
                      >
                        {/* Selection indicator */}
                        <div className="w-4 h-4 flex-shrink-0">
                          {model.id === selectedModel && (
                            <Check
                              className="w-4 h-4"
                              style={{ color: providers[provider].color }}
                            />
                          )}
                        </div>

                        {/* Model info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[var(--foreground)]">
                              {model.name}
                            </span>
                            {model.isOnline && (
                              <Globe className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
                            )}
                            {model.capabilities.includes('vision') && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                                Vision
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[var(--foreground-subtle)] truncate">
                            {model.description}
                          </p>
                        </div>

                        {/* Pricing */}
                        <div className="flex items-center gap-1 text-xs text-[var(--foreground-subtle)]">
                          <Zap className="w-3 h-3" />
                          ${model.pricing.input}/{model.pricing.output}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--border)] px-3 py-2 text-xs text-[var(--foreground-subtle)]">
            Prices per 1M tokens (input/output)
          </div>
        </div>
      )}
    </div>
  );
}

