// ============================================================
// Core Types
// ============================================================

export type Provider = 
  | 'openai' 
  | 'anthropic' 
  | 'google' 
  | 'xai' 
  | 'meta' 
  | 'perplexity' 
  | 'mistral';

export interface AIModel {
  id: string;
  name: string;
  provider: Provider;
  description: string;
  contextLength: number;
  pricing: {
    input: number;  // per million tokens
    output: number; // per million tokens
  };
  capabilities: ('chat' | 'code' | 'vision' | 'search' | 'analysis')[];
  isOnline: boolean; // Can search the web
}

// ============================================================
// Chat Types
// ============================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  model?: string;
  isStreaming?: boolean;
  metadata?: {
    tokens?: number;
    ragSources?: string[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    ragCollectionId?: string;
    systemPrompt?: string;
  };
}

export interface StreamChunk {
  type: 'content' | 'error' | 'done';
  content?: string;
  error?: string;
}

// ============================================================
// RAG Types
// ============================================================

export interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'txt' | 'vtt' | 'pptx' | 'md' | 'url';
  content: string;
  metadata: DocumentMetadata;
  createdAt: number;
}

export interface DocumentMetadata {
  source: 'upload' | 'crawl' | 'transcription';
  originalName?: string;
  url?: string;
  wordCount?: number;
  pageCount?: number;
  author?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata: {
    startIndex: number;
    endIndex: number;
    pageNumber?: number;
  };
}

export interface RAGCollection {
  id: string;
  name: string;
  documentIds: string[];
  createdAt: number;
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  document: Document;
  score: number;
}

// ============================================================
// Audio Types
// ============================================================

export interface Recording {
  id: string;
  name: string;
  source: 'microphone' | 'system_audio' | 'screen';
  duration: number;
  size: number;
  mimeType: string;
  createdAt: number;
  blobUrl?: string;
}

export interface Transcription {
  id: string;
  recordingId?: string;
  audioFileName?: string;
  text: string;
  segments: TranscriptionSegment[];
  language: string;
  duration: number;
  createdAt: number;
}

export interface TranscriptionSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

// ============================================================
// DeepSearch Types
// ============================================================

export interface DeepSearchQuery {
  question: string;
  subQuestions?: string[];
  searchResults?: DeepSearchResult[];
  synthesis?: string;
  citations?: Citation[];
  status: 'pending' | 'searching' | 'synthesizing' | 'complete' | 'error';
}

export interface DeepSearchResult {
  question: string;
  answer: string;
  sources: Citation[];
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  snippet?: string;
}

// ============================================================
// Spreadsheet Types
// ============================================================

export interface SpreadsheetData {
  headers: string[];
  rows: (string | number)[][];
}

export interface SpreadsheetExport {
  format: 'xlsx' | 'csv' | 'google';
  data: SpreadsheetData;
  name: string;
}

// ============================================================
// Export Types
// ============================================================

export type ExportFormat = 'excel' | 'pdf' | 'word' | 'ppt' | 'image';

export interface ExportOptions {
  format: ExportFormat;
  title?: string;
  author?: string;
  includeMetadata?: boolean;
}

// ============================================================
// UI Types
// ============================================================

export type CurrentView = 
  | 'chat' 
  | 'compare' 
  | 'search' 
  | 'deepsearch' 
  | 'knowledge' 
  | 'audio' 
  | 'spreadsheet';

export interface ViewConfig {
  id: CurrentView;
  label: string;
  icon: string;
  description: string;
}
