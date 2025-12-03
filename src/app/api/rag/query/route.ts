import { NextRequest } from 'next/server';
import { searchSimilar, buildRAGContext } from '@/lib/rag/vectordb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface QueryRequest {
  query: string;
  topK?: number;
  documentIds?: string[];
  includeContext?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: QueryRequest = await request.json();
    const { query, topK = 5, documentIds, includeContext = false } = body;

    if (!query || query.trim().length === 0) {
      return Response.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Search for similar chunks
    const results = await searchSimilar(query, topK, documentIds);

    // Build response
    const response: {
      success: boolean;
      data: {
        results: typeof results;
        context?: string;
      };
    } = {
      success: true,
      data: {
        results: results.map(r => ({
          ...r,
          score: Math.round(r.score * 1000) / 1000, // Round to 3 decimals
        })),
      },
    };

    // Include formatted context if requested
    if (includeContext) {
      response.data.context = buildRAGContext(results);
    }

    return Response.json(response);
  } catch (error) {
    console.error('Query error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to search documents' 
      },
      { status: 500 }
    );
  }
}

