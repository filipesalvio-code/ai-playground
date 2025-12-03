import type { DocumentChunk } from '../types';

interface ChunkOptions {
  chunkSize?: number;      // Target size in characters (roughly 4 chars = 1 token)
  chunkOverlap?: number;   // Overlap between chunks
  minChunkSize?: number;   // Minimum chunk size
}

const DEFAULT_OPTIONS: Required<ChunkOptions> = {
  chunkSize: 2000,        // ~500 tokens
  chunkOverlap: 200,      // ~50 tokens overlap
  minChunkSize: 100,      // Minimum 100 characters
};

/**
 * Split text into overlapping chunks for embedding
 */
export function splitIntoChunks(
  text: string,
  documentId: string,
  options: ChunkOptions = {}
): Omit<DocumentChunk, 'embedding'>[] {
  const { chunkSize, chunkOverlap, minChunkSize } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  // Clean and normalize text
  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (normalizedText.length <= chunkSize) {
    // Text is small enough to be a single chunk
    return [
      {
        id: `${documentId}-chunk-0`,
        documentId,
        content: normalizedText,
        metadata: {
          startIndex: 0,
          endIndex: normalizedText.length,
        },
      },
    ];
  }

  const chunks: Omit<DocumentChunk, 'embedding'>[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < normalizedText.length) {
    // Calculate end index
    let endIndex = startIndex + chunkSize;

    // If we're not at the end, try to break at a sentence or paragraph
    if (endIndex < normalizedText.length) {
      endIndex = findBreakPoint(normalizedText, startIndex, endIndex);
    } else {
      endIndex = normalizedText.length;
    }

    // Extract chunk content
    const content = normalizedText.slice(startIndex, endIndex).trim();

    // Only add if chunk meets minimum size
    if (content.length >= minChunkSize) {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        documentId,
        content,
        metadata: {
          startIndex,
          endIndex,
        },
      });
      chunkIndex++;
    }

    // Move to next chunk with overlap
    startIndex = endIndex - chunkOverlap;
    
    // Prevent infinite loop
    if (startIndex >= normalizedText.length - minChunkSize) {
      break;
    }
  }

  return chunks;
}

/**
 * Find a good break point (sentence or paragraph end)
 */
function findBreakPoint(text: string, start: number, idealEnd: number): number {
  // Look for paragraph break first (within 20% of chunk size)
  const searchStart = Math.max(start, idealEnd - 400);
  const searchText = text.slice(searchStart, idealEnd);
  
  // Prefer paragraph breaks
  const paragraphBreak = searchText.lastIndexOf('\n\n');
  if (paragraphBreak !== -1 && paragraphBreak > searchText.length * 0.5) {
    return searchStart + paragraphBreak + 2;
  }

  // Then sentence breaks
  const sentenceBreaks = ['. ', '! ', '? ', '.\n', '!\n', '?\n'];
  for (const breakChar of sentenceBreaks) {
    const breakIndex = searchText.lastIndexOf(breakChar);
    if (breakIndex !== -1 && breakIndex > searchText.length * 0.5) {
      return searchStart + breakIndex + breakChar.length;
    }
  }

  // Fall back to line breaks
  const lineBreak = searchText.lastIndexOf('\n');
  if (lineBreak !== -1 && lineBreak > searchText.length * 0.5) {
    return searchStart + lineBreak + 1;
  }

  // Last resort: space
  const spaceBreak = searchText.lastIndexOf(' ');
  if (spaceBreak !== -1 && spaceBreak > searchText.length * 0.5) {
    return searchStart + spaceBreak + 1;
  }

  // If no good break point, just use the ideal end
  return idealEnd;
}

/**
 * Estimate token count for text
 * Rough approximation: ~4 characters per token for English
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Split text by sentences
 */
export function splitBySentences(text: string): string[] {
  // Split on sentence-ending punctuation followed by space or newline
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Split text by paragraphs
 */
export function splitByParagraphs(text: string): string[] {
  return text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

