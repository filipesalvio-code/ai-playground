import type { Message, StreamChunk } from './types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter API client for chat completions
 */
export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || '';
    this.baseUrl = OPENROUTER_URL;
    
    if (!this.apiKey) {
      console.warn('OpenRouter API key not configured');
    }
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AI Playground',
    };
  }

  /**
   * Send a chat completion request (non-streaming)
   */
  async chat(
    model: string,
    messages: Message[],
    options: Partial<ChatCompletionRequest> = {}
  ): Promise<ChatCompletionResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Send a streaming chat completion request
   * Returns a ReadableStream that yields content chunks
   */
  async chatStream(
    model: string,
    messages: Message[],
    options: Partial<ChatCompletionRequest> = {}
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: true,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    return response.body;
  }

  /**
   * Parse SSE stream and yield content chunks
   */
  static async *parseStream(
    stream: ReadableStream<Uint8Array>
  ): AsyncGenerator<StreamChunk> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          yield { type: 'done' };
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          
          if (!trimmed || trimmed === 'data: [DONE]') {
            continue;
          }

          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const content = json.choices?.[0]?.delta?.content;
              
              if (content) {
                yield { type: 'content', content };
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Stream error' 
      };
    } finally {
      reader.releaseLock();
    }
  }
}

/**
 * Create a streaming response for Next.js API routes
 */
export function createStreamingResponse(
  stream: ReadableStream<Uint8Array>
): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

/**
 * Transform OpenRouter stream to a simpler text stream
 */
export function transformToTextStream(
  stream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      for await (const chunk of OpenRouterClient.parseStream(stream)) {
        if (chunk.type === 'content' && chunk.content) {
          controller.enqueue(encoder.encode(chunk.content));
        } else if (chunk.type === 'error') {
          controller.error(new Error(chunk.error));
        } else if (chunk.type === 'done') {
          controller.close();
        }
      }
    },
  });
}

/**
 * Helper to create chat messages array with system prompt
 */
export function buildMessages(
  messages: Message[],
  systemPrompt?: string,
  ragContext?: string
): { role: string; content: string }[] {
  const result: { role: string; content: string }[] = [];

  // Add system prompt if provided
  if (systemPrompt || ragContext) {
    let systemContent = systemPrompt || 'You are a helpful AI assistant.';
    
    if (ragContext) {
      systemContent += `\n\nRelevant context from the knowledge base:\n${ragContext}`;
    }
    
    result.push({ role: 'system', content: systemContent });
  }

  // Add conversation messages
  for (const msg of messages) {
    result.push({
      role: msg.role,
      content: msg.content,
    });
  }

  return result;
}

// Export singleton instance
export const openRouter = new OpenRouterClient();

