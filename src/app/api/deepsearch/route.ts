import { NextRequest } from 'next/server';
import { createResearcher } from '@/lib/deepsearch/researcher';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow longer execution for research

interface DeepSearchRequest {
  question: string;
  maxSubQuestions?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeepSearchRequest = await request.json();
    const { question, maxSubQuestions = 5 } = body;

    if (!question || question.trim().length === 0) {
      return Response.json(
        { error: 'Research question is required' },
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

    // Create researcher
    const researcher = createResearcher({ maxSubQuestions });

    // Run research
    const result = await researcher.research(question);

    return Response.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('DeepSearch error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Research failed' 
      },
      { status: 500 }
    );
  }
}

/**
 * Streaming endpoint for real-time progress updates
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const question = searchParams.get('question');

  if (!question) {
    return Response.json(
      { error: 'Question parameter is required' },
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

  const encoder = new TextEncoder();
  const researcher = createResearcher();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await researcher.research(question, (update) => {
          // Send SSE update
          const data = JSON.stringify(update);
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        });
        
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        const errorData = JSON.stringify({ 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Research failed' 
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

