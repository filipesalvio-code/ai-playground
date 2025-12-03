import { NextRequest } from 'next/server';
import { OpenRouterClient, buildMessages } from '@/lib/openrouter';
import type { Message } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CompareRequest {
  models: string[];
  messages: Message[];
  ragContext?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelResponse {
  model: string;
  content: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: CompareRequest = await request.json();
    const { 
      models, 
      messages, 
      ragContext, 
      systemPrompt,
      temperature = 0.7,
      maxTokens,
    } = body;

    if (!models || models.length === 0) {
      return Response.json(
        { error: 'At least one model is required' },
        { status: 400 }
      );
    }

    if (models.length > 4) {
      return Response.json(
        { error: 'Maximum 4 models can be compared at once' },
        { status: 400 }
      );
    }

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const client = new OpenRouterClient(apiKey);
    const formattedMessages = buildMessages(messages, systemPrompt, ragContext);

    // Execute all model requests in parallel
    const results = await Promise.allSettled(
      models.map(async (model): Promise<ModelResponse> => {
        try {
          const response = await client.chat(model, messages, {
            temperature,
            max_tokens: maxTokens,
          });

          return {
            model,
            content: response.choices[0]?.message?.content || '',
            usage: response.usage,
          };
        } catch (error) {
          return {
            model,
            content: '',
            error: error instanceof Error ? error.message : 'Failed to get response',
          };
        }
      })
    );

    // Process results
    const responses: ModelResponse[] = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          model: models[index],
          content: '',
          error: result.reason?.message || 'Request failed',
        };
      }
    });

    return Response.json({
      success: true,
      data: {
        responses,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Compare API error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to compare models' 
      },
      { status: 500 }
    );
  }
}

/**
 * Streaming comparison endpoint - streams responses from multiple models
 * Each model's response is prefixed with the model name
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const modelsParam = searchParams.get('models');
  const prompt = searchParams.get('prompt');

  if (!modelsParam || !prompt) {
    return Response.json(
      { error: 'Models and prompt are required' },
      { status: 400 }
    );
  }

  const models = modelsParam.split(',').slice(0, 4);
  const messages: Message[] = [
    { 
      id: '1', 
      role: 'user', 
      content: prompt, 
      timestamp: Date.now() 
    }
  ];

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: 'OpenRouter API key not configured' },
      { status: 500 }
    );
  }

  const encoder = new TextEncoder();
  const client = new OpenRouterClient(apiKey);

  const stream = new ReadableStream({
    async start(controller) {
      // Process models sequentially for cleaner output
      for (const model of models) {
        try {
          // Send model header
          controller.enqueue(
            encoder.encode(`\n--- ${model} ---\n`)
          );

          const response = await client.chatStream(model, messages);
          
          for await (const chunk of OpenRouterClient.parseStream(response)) {
            if (chunk.type === 'content' && chunk.content) {
              controller.enqueue(encoder.encode(chunk.content));
            }
          }

          controller.enqueue(encoder.encode('\n'));
        } catch (error) {
          controller.enqueue(
            encoder.encode(`\nError: ${error instanceof Error ? error.message : 'Failed'}\n`)
          );
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

