import type { Model, Provider } from './types';

/**
 * Provider metadata with branding
 */
export const providers: Record<Provider, { name: string; color: string; icon: string }> = {
  openai: {
    name: 'OpenAI',
    color: '#10a37f',
    icon: '◯',
  },
  anthropic: {
    name: 'Anthropic',
    color: '#d4a27f',
    icon: '◈',
  },
  google: {
    name: 'Google',
    color: '#4285f4',
    icon: '◇',
  },
  xai: {
    name: 'xAI',
    color: '#1da1f2',
    icon: '✕',
  },
  perplexity: {
    name: 'Perplexity',
    color: '#20b2aa',
    icon: '◎',
  },
  meta: {
    name: 'Meta',
    color: '#0668e1',
    icon: '∞',
  },
};

/**
 * Available models via OpenRouter
 */
export const models: Model[] = [
  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable GPT-4 model with vision',
    contextLength: 128000,
    pricing: { input: 2.5, output: 10 },
    capabilities: ['chat', 'vision', 'code', 'function_calling', 'json_mode', 'streaming'],
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and affordable GPT-4 variant',
    contextLength: 128000,
    pricing: { input: 0.15, output: 0.6 },
    capabilities: ['chat', 'vision', 'code', 'function_calling', 'json_mode', 'streaming'],
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    description: 'GPT-4 Turbo with vision capabilities',
    contextLength: 128000,
    pricing: { input: 10, output: 30 },
    capabilities: ['chat', 'vision', 'code', 'function_calling', 'json_mode', 'streaming'],
  },

  // Anthropic
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Most intelligent Claude model',
    contextLength: 200000,
    pricing: { input: 3, output: 15 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Powerful model for complex tasks',
    contextLength: 200000,
    pricing: { input: 15, output: 75 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and compact Claude model',
    contextLength: 200000,
    pricing: { input: 0.25, output: 1.25 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },

  // Google
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Google\'s most capable model with 1M context',
    contextLength: 1000000,
    pricing: { input: 2.5, output: 10 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast Gemini model for quick tasks',
    contextLength: 1000000,
    pricing: { input: 0.25, output: 1 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },

  // xAI
  {
    id: 'x-ai/grok-2-1212',
    name: 'Grok 2',
    provider: 'xai',
    description: 'xAI\'s flagship model with real-time knowledge',
    contextLength: 131072,
    pricing: { input: 2, output: 10 },
    capabilities: ['chat', 'code', 'streaming'],
  },
  {
    id: 'x-ai/grok-2-vision-1212',
    name: 'Grok 2 Vision',
    provider: 'xai',
    description: 'Grok 2 with image understanding',
    contextLength: 32768,
    pricing: { input: 2, output: 10 },
    capabilities: ['chat', 'vision', 'code', 'streaming'],
  },

  // Perplexity (Online models with web search)
  {
    id: 'perplexity/llama-3.1-sonar-large-128k-online',
    name: 'Sonar Large (Online)',
    provider: 'perplexity',
    description: 'Large model with real-time web search',
    contextLength: 128000,
    pricing: { input: 1, output: 1 },
    capabilities: ['chat', 'streaming', 'web_search'],
    isOnline: true,
  },
  {
    id: 'perplexity/llama-3.1-sonar-small-128k-online',
    name: 'Sonar Small (Online)',
    provider: 'perplexity',
    description: 'Fast model with real-time web search',
    contextLength: 128000,
    pricing: { input: 0.2, output: 0.2 },
    capabilities: ['chat', 'streaming', 'web_search'],
    isOnline: true,
  },
  {
    id: 'perplexity/llama-3.1-sonar-huge-128k-online',
    name: 'Sonar Huge (Online)',
    provider: 'perplexity',
    description: 'Most powerful Perplexity model with web search',
    contextLength: 128000,
    pricing: { input: 5, output: 5 },
    capabilities: ['chat', 'streaming', 'web_search'],
    isOnline: true,
  },

  // Meta
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    description: 'Largest open-source model',
    contextLength: 131072,
    pricing: { input: 2.7, output: 2.7 },
    capabilities: ['chat', 'code', 'streaming'],
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'meta',
    description: 'Powerful open-source model',
    contextLength: 131072,
    pricing: { input: 0.52, output: 0.75 },
    capabilities: ['chat', 'code', 'streaming'],
  },
];

/**
 * Get model by ID
 */
export function getModel(id: string): Model | undefined {
  return models.find((m) => m.id === id);
}

/**
 * Get models by provider
 */
export function getModelsByProvider(provider: Provider): Model[] {
  return models.filter((m) => m.provider === provider);
}

/**
 * Get models with a specific capability
 */
export function getModelsWithCapability(capability: string): Model[] {
  return models.filter((m) => m.capabilities.includes(capability as never));
}

/**
 * Get online models (with web search)
 */
export function getOnlineModels(): Model[] {
  return models.filter((m) => m.isOnline);
}

/**
 * Get vision-capable models
 */
export function getVisionModels(): Model[] {
  return models.filter((m) => m.capabilities.includes('vision'));
}

/**
 * Default model for chat
 */
export const DEFAULT_MODEL = 'openai/gpt-4o';

/**
 * Default model for web search
 */
export const DEFAULT_SEARCH_MODEL = 'perplexity/llama-3.1-sonar-large-128k-online';

/**
 * Default model for deep search
 */
export const DEFAULT_DEEPSEARCH_MODEL = 'perplexity/llama-3.1-sonar-huge-128k-online';

/**
 * Image generation model
 */
export const IMAGE_MODEL = 'openai/dall-e-3';

