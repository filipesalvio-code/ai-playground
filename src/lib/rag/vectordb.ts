import type { DocumentChunk, RAGSearchResult, Document } from '../types';
import { generateEmbedding, cosineSimilarity } from './embeddings';

// In-memory vector store for simplicity
// In production, use LanceDB or similar
interface VectorRecord {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: {
    startIndex: number;
    endIndex: number;
    pageNumber?: number;
  };
}

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: number;
  metadata: Record<string, unknown>;
}

// In-memory storage (persisted to localStorage in browser)
let vectorStore: VectorRecord[] = [];
let documentStore: Map<string, DocumentRecord> = new Map();

/**
 * Initialize the vector database
 * In production, this would connect to LanceDB
 */
export async function initVectorDB(): Promise<void> {
  // For now, we use in-memory storage
  // In production, initialize LanceDB here
  console.log('Vector DB initialized (in-memory mode)');
}

/**
 * Add a document with its chunks to the vector store
 */
export async function addDocument(
  document: Document,
  chunks: Omit<DocumentChunk, 'embedding'>[]
): Promise<void> {
  // Store document metadata
  documentStore.set(document.id, {
    id: document.id,
    name: document.name,
    type: document.type,
    content: document.content,
    createdAt: document.createdAt,
    metadata: document.metadata as unknown as Record<string, unknown>,
  });

  // Generate embeddings for all chunks in batch
  const texts = chunks.map(chunk => chunk.content);
  const { generateEmbeddings } = await import('./embeddings');
  const embeddings = await generateEmbeddings(texts);

  // Add chunks with embeddings to vector store
  for (let i = 0; i < chunks.length; i++) {
    vectorStore.push({
      id: chunks[i].id,
      documentId: chunks[i].documentId,
      content: chunks[i].content,
      embedding: embeddings[i],
      metadata: chunks[i].metadata,
    });
  }
}

/**
 * Search for similar chunks using vector similarity
 */
export async function searchSimilar(
  query: string,
  topK: number = 5,
  documentIds?: string[]
): Promise<RAGSearchResult[]> {
  if (vectorStore.length === 0) {
    return [];
  }

  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);

  // Filter by document IDs if provided
  let candidates = vectorStore;
  if (documentIds && documentIds.length > 0) {
    candidates = vectorStore.filter(record => 
      documentIds.includes(record.documentId)
    );
  }

  // Calculate similarities
  const scored = candidates.map(record => ({
    record,
    score: cosineSimilarity(queryEmbedding, record.embedding),
  }));

  // Sort by similarity (highest first)
  scored.sort((a, b) => b.score - a.score);

  // Take top K results
  const topResults = scored.slice(0, topK);

  // Build results with document info
  return topResults.map(({ record, score }) => {
    const doc = documentStore.get(record.documentId);
    
    return {
      chunk: {
        id: record.id,
        documentId: record.documentId,
        content: record.content,
        metadata: record.metadata,
      },
      document: {
        id: doc?.id || record.documentId,
        name: doc?.name || 'Unknown',
        type: (doc?.type || 'unknown') as Document['type'],
        content: doc?.content || '',
        createdAt: doc?.createdAt || Date.now(),
        metadata: {
          source: 'upload' as const,
          ...(doc?.metadata || {}),
        },
      },
      score,
    };
  });
}

/**
 * Delete a document and its chunks
 */
export async function deleteDocument(documentId: string): Promise<void> {
  // Remove chunks
  vectorStore = vectorStore.filter(record => record.documentId !== documentId);
  
  // Remove document
  documentStore.delete(documentId);
}

/**
 * Get all documents
 */
export function getAllDocuments(): DocumentRecord[] {
  return Array.from(documentStore.values());
}

/**
 * Get document by ID
 */
export function getDocument(documentId: string): DocumentRecord | undefined {
  return documentStore.get(documentId);
}

/**
 * Get chunk count for a document
 */
export function getChunkCount(documentId: string): number {
  return vectorStore.filter(record => record.documentId === documentId).length;
}

/**
 * Get total chunk count
 */
export function getTotalChunkCount(): number {
  return vectorStore.length;
}

/**
 * Clear all data
 */
export function clearAll(): void {
  vectorStore = [];
  documentStore.clear();
}

/**
 * Build RAG context from search results
 */
export function buildRAGContext(results: RAGSearchResult[]): string {
  if (results.length === 0) {
    return '';
  }

  const contextParts = results.map((result, index) => {
    return `[Source ${index + 1}: ${result.document.name}]\n${result.chunk.content}`;
  });

  return contextParts.join('\n\n---\n\n');
}

