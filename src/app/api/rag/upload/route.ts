import { NextRequest } from 'next/server';
import { parseFile, isSupported } from '@/lib/rag/parsers';
import { splitIntoChunks } from '@/lib/rag/chunker';
import { addDocument } from '@/lib/rag/vectordb';
import type { Document } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const collectionId = formData.get('collectionId') as string | null;

    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!isSupported(file.name)) {
      return Response.json(
        { error: 'Unsupported file type. Supported: PDF, DOCX, TXT, VTT, PPTX' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return Response.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse file
    const parseResult = await parseFile(buffer, file.name);

    // Create document
    const documentId = crypto.randomUUID();
    const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
    
    const document: Document = {
      id: documentId,
      name: file.name,
      type: extension as Document['type'],
      content: parseResult.text,
      metadata: {
        source: 'upload',
        originalName: file.name,
        ...parseResult.metadata,
      },
      createdAt: Date.now(),
    };

    // Split into chunks
    const chunks = splitIntoChunks(parseResult.text, documentId);

    // Add to vector database
    await addDocument(document, chunks);

    return Response.json({
      success: true,
      data: {
        documentId,
        name: file.name,
        type: extension,
        chunkCount: chunks.length,
        wordCount: parseResult.metadata.wordCount,
        pageCount: parseResult.metadata.pageCount,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process file' 
      },
      { status: 500 }
    );
  }
}

