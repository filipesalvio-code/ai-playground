import type { Provider, AIModel } from './types';

// Provider definitions with colors and icons
export const providers: Record<Provider, { name: string; color: string; icon: string }> = {
  openai: { name: 'OpenAI', color: '#10a37f', icon: '◐' },
  anthropic: { name: 'Anthropic', color: '#cc785c', icon: '◑' },
  google: { name: 'Google', color: '#4285f4', icon: '◒' },
  xai: { name: 'xAI', color: '#ffffff', icon: '✕' },
  meta: { name: 'Meta', color: '#0081FB', icon: '◓' },
  perplexity: { name: 'Perplexity', color: '#20808d', icon: '◔' },
  mistral: { name: 'Mistral', color: '#f97316', icon: '◕' },
};

// Available models via OpenRouter
export const models: AIModel[] = [
  // OpenAI
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable GPT-4 model, multimodal',
    contextLength: 128000,
    pricing: { input: 2.5, output: 10 },
    capabilities: ['chat', 'code', 'vision', 'analysis'],
    isOnline: false,
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and affordable GPT-4',
    contextLength: 128000,
    pricing: { input: 0.15, output: 0.6 },
    capabilities: ['chat', 'code', 'vision'],
    isOnline: false,
  },
  {
    id: 'openai/o1-preview',
    name: 'o1 Preview',
    provider: 'openai',
    description: 'Advanced reasoning model',
    contextLength: 128000,
    pricing: { input: 15, output: 60 },
    capabilities: ['chat', 'code', 'analysis'],
    isOnline: false,
  },

  // Anthropic
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Most intelligent Claude model',
    contextLength: 200000,
    pricing: { input: 3, output: 15 },
    capabilities: ['chat', 'code', 'vision', 'analysis'],
    isOnline: false,
  },
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Powerful, thoughtful analysis',
    contextLength: 200000,
    pricing: { input: 15, output: 75 },
    capabilities: ['chat', 'code', 'vision', 'analysis'],
    isOnline: false,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and compact',
    contextLength: 200000,
    pricing: { input: 0.25, output: 1.25 },
    capabilities: ['chat', 'code', 'vision'],
    isOnline: false,
  },

  // Google
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Advanced multimodal AI',
    contextLength: 1000000,
    pricing: { input: 2.5, output: 10 },
    capabilities: ['chat', 'code', 'vision', 'analysis'],
    isOnline: false,
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient',
    contextLength: 1000000,
    pricing: { input: 0.075, output: 0.3 },
    capabilities: ['chat', 'code', 'vision'],
    isOnline: false,
  },

  // xAI
  {
    id: 'x-ai/grok-2-1212',
    name: 'Grok 2',
    provider: 'xai',
    description: 'Real-time knowledge, witty',
    contextLength: 131072,
    pricing: { input: 2, output: 10 },
    capabilities: ['chat', 'code', 'analysis'],
    isOnline: true,
  },

  // Meta
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    provider: 'meta',
    description: 'Largest open model',
    contextLength: 128000,
    pricing: { input: 2.7, output: 2.7 },
    capabilities: ['chat', 'code', 'analysis'],
    isOnline: false,
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B',
    provider: 'meta',
    description: 'Powerful open model',
    contextLength: 128000,
    pricing: { input: 0.52, output: 0.75 },
    capabilities: ['chat', 'code'],
    isOnline: false,
  },

  // Perplexity
  {
    id: 'perplexity/sonar-pro',
    name: 'Sonar Pro',
    provider: 'perplexity',
    description: 'Best online search model',
    contextLength: 200000,
    pricing: { input: 3, output: 15 },
    capabilities: ['chat', 'search'],
    isOnline: true,
  },
  {
    id: 'perplexity/sonar',
    name: 'Sonar',
    provider: 'perplexity',
    description: 'Fast online search',
    contextLength: 127000,
    pricing: { input: 1, output: 1 },
    capabilities: ['chat', 'search'],
    isOnline: true,
  },

  // Mistral
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    provider: 'mistral',
    description: 'Flagship European model',
    contextLength: 128000,
    pricing: { input: 2, output: 6 },
    capabilities: ['chat', 'code', 'analysis'],
    isOnline: false,
  },
];

// Default model
export const DEFAULT_MODEL = 'anthropic/claude-3.5-sonnet';

// Default search model (Perplexity for online search)
export const DEFAULT_SEARCH_MODEL = 'perplexity/sonar-pro';

// Default DeepSearch model
export const DEFAULT_DEEPSEARCH_MODEL = 'perplexity/sonar';

// Get model by ID
export function getModel(id: string): AIModel | undefined {
  return models.find((m) => m.id === id);
}

// Get models by provider
export function getModelsByProvider(provider: Provider): AIModel[] {
  return models.filter((m) => m.provider === provider);
}

// Get online-capable models
export function getOnlineModels(): AIModel[] {
  return models.filter((m) => m.isOnline);
}

// Get models with specific capability
export function getModelsWithCapability(
  capability: AIModel['capabilities'][number]
): AIModel[] {
  return models.filter((m) => m.capabilities.includes(capability));
}
