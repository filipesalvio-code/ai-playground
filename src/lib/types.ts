// ============================================
// AI PLAYGROUND - SHARED TYPES
// ============================================

// ============================================
// CHAT & MESSAGES
// ============================================

export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: Role;
  content: string;
  model?: string;
  timestamp: number;
  attachments?: Attachment[];
  citations?: Citation[];
  isStreaming?: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image' | 'audio';
  url?: string;
  content?: string;
  mimeType: string;
  size: number;
}

export interface Citation {
  id: string;
  title: string;
  url: string;
  snippet?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
  ragEnabled?: boolean;
  collectionIds?: string[];
}

// ============================================
// AI MODELS
// ============================================

export type Provider = 'openai' | 'anthropic' | 'google' | 'xai' | 'perplexity' | 'meta';

export interface Model {
  id: string;
  name: string;
  provider: Provider;
  description: string;
  contextLength: number;
  pricing: {
    input: number;  // per 1M tokens
    output: number; // per 1M tokens
  };
  capabilities: ModelCapability[];
  isOnline?: boolean; // Has web search (Perplexity)
}

export type ModelCapability = 
  | 'chat' 
  | 'vision' 
  | 'code' 
  | 'function_calling' 
  | 'json_mode'
  | 'streaming'
  | 'web_search';

// ============================================
// RAG (Retrieval-Augmented Generation)
// ============================================

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  content: string;
  metadata: DocumentMetadata;
  chunks?: DocumentChunk[];
  createdAt: number;
}

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'vtt' | 'pptx' | 'webpage' | 'audio_transcript';

export interface DocumentMetadata {
  source: 'upload' | 'crawl' | 'transcription';
  originalName?: string;
  url?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
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

export interface Collection {
  id: string;
  name: string;
  description?: string;
  documentIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RAGSearchResult {
  chunk: DocumentChunk;
  document: Document;
  score: number;
}

// ============================================
// WEB CRAWLING
// ============================================

export interface CrawlConfig {
  url: string;
  maxDepth: number;
  maxPages: number;
  includePaths?: string[];
  excludePaths?: string[];
  respectRobotsTxt: boolean;
}

export interface CrawlResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  crawledAt: number;
  success: boolean;
  error?: string;
}

// ============================================
// AUDIO & TRANSCRIPTION
// ============================================

export type RecordingSource = 'microphone' | 'system_audio' | 'screen';

export interface Recording {
  id: string;
  name: string;
  source: RecordingSource;
  duration: number; // seconds
  size: number; // bytes
  mimeType: string;
  blob?: Blob;
  url?: string;
  createdAt: number;
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
  start: number; // seconds
  end: number;   // seconds
  text: string;
  speaker?: string;
}

// ============================================
// DEEPSEARCH
// ============================================

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

// ============================================
// EXPORTS
// ============================================

export type ExportFormat = 'excel' | 'pdf' | 'word' | 'ppt' | 'jpg' | 'png';

export interface ExportOptions {
  format: ExportFormat;
  title?: string;
  includeTimestamps?: boolean;
  includeMetadata?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

// ============================================
// SPREADSHEET
// ============================================

export interface SpreadsheetData {
  headers: string[];
  rows: (string | number | boolean | null)[][];
  sheetName?: string;
}

export interface GoogleSheetsConfig {
  spreadsheetId?: string;
  sheetName?: string;
  range?: string;
}

// ============================================
// INTEGRATIONS
// ============================================

export interface GammaRequest {
  prompt: string;
  type: 'presentation' | 'document' | 'webpage';
  style?: string;
}

export interface ConsensusSearchResult {
  paperId: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  url: string;
  citationCount: number;
  claim?: string;
}

// ============================================
// API RESPONSES
// ============================================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface StreamChunk {
  type: 'content' | 'done' | 'error';
  content?: string;
  error?: string;
}

// ============================================
// UI STATE
// ============================================

export type ViewMode = 'chat' | 'compare' | 'search' | 'deepsearch' | 'knowledge' | 'audio' | 'spreadsheet';

export interface UIState {
  sidebarOpen: boolean;
  currentView: ViewMode;
  selectedModel: string;
  compareModels: string[];
  ragEnabled: boolean;
  selectedCollections: string[];
}

// ============================================
// SETTINGS
// ============================================

export interface Settings {
  theme: 'dark' | 'light' | 'system';
  defaultModel: string;
  streamResponses: boolean;
  autoSaveConversations: boolean;
  showTokenCount: boolean;
  maxContextMessages: number;
}

