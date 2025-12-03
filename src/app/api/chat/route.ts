import { NextRequest } from 'next/server';
import { OpenRouterClient, buildMessages, transformToTextStream } from '@/lib/openrouter';
import type { Message } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ChatRequest {
  model: string;
  messages: Message[];
  stream?: boolean;
  ragContext?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { 
      model, 
      messages, 
      stream = true, 
      ragContext, 
      systemPrompt,
      temperature = 0.7,
      maxTokens,
    } = body;

    if (!model) {
      return Response.json(
        { error: 'Model is required' },
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

    if (stream) {
      // Streaming response
      const streamResponse = await client.chatStream(model, messages, {
        temperature,
        max_tokens: maxTokens,
      });

      // Transform to simple text stream
      const textStream = transformToTextStream(streamResponse);

      return new Response(textStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming response
      const response = await client.chat(model, messages, {
        temperature,
        max_tokens: maxTokens,
      });

      return Response.json({
        success: true,
        data: {
          content: response.choices[0]?.message?.content || '',
          model: response.model,
          usage: response.usage,
        },
      });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process chat request' 
      },
      { status: 500 }
    );
  }
}

