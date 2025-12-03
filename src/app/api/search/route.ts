import { NextRequest } from 'next/server';
import { OpenRouterClient, transformToTextStream } from '@/lib/openrouter';
import { DEFAULT_SEARCH_MODEL } from '@/lib/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SearchRequest {
  query: string;
  model?: string;
  stream?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();
    const { query, model = DEFAULT_SEARCH_MODEL, stream = true } = body;

    if (!query || query.trim().length === 0) {
      return Response.json(
        { error: 'Search query is required' },
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

    // Create search-optimized prompt
    const messages = [
      {
        id: '1',
        role: 'user' as const,
        content: query,
        timestamp: Date.now(),
      },
    ];

    if (stream) {
      const streamResponse = await client.chatStream(model, messages);
      const textStream = transformToTextStream(streamResponse);

      return new Response(textStream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      const response = await client.chat(model, messages);

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
    console.error('Search API error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Search failed' 
      },
      { status: 500 }
    );
  }
}

