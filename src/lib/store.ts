import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Message, 
  Conversation, 
  Document, 
  RAGCollection,
  Recording,
  Transcription,
  DeepSearchQuery,
  SpreadsheetData,
  CurrentView
} from './types';
import { DEFAULT_MODEL } from './models';

// ============================================================
// UI Store - Global UI state
// ============================================================
interface UIState {
  sidebarOpen: boolean;
  currentView: CurrentView;
  selectedModel: string;
  deepSearchQuery: DeepSearchQuery | null;
  isLoading: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setCurrentView: (view: CurrentView) => void;
  setSelectedModel: (model: string) => void;
  setDeepSearchQuery: (query: DeepSearchQuery | null | ((prev: DeepSearchQuery | null) => DeepSearchQuery | null)) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentView: 'chat',
      selectedModel: DEFAULT_MODEL,
      deepSearchQuery: null,
      isLoading: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setDeepSearchQuery: (query) => set((state) => ({ 
        deepSearchQuery: typeof query === 'function' ? query(state.deepSearchQuery) : query 
      })),
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'ai-playground-ui',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        selectedModel: state.selectedModel,
      }),
    }
  )
);

// ============================================================
// Conversations Store - Chat history
// ============================================================
interface ConversationsState {
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Actions
  createConversation: (model: string) => string;
  setCurrentConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  getCurrentConversation: () => Conversation | null;
  updateConversationTitle: (id: string, title: string) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (model) => {
        const id = crypto.randomUUID();
        const conversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          model,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        
        return id;
      },

      setCurrentConversation: (id) => set({ currentConversationId: id }),

      deleteConversation: (id) => set((state) => {
        const newConversations = state.conversations.filter((c) => c.id !== id);
        const newCurrentId = state.currentConversationId === id
          ? newConversations[0]?.id || null
          : state.currentConversationId;
        
        return {
          conversations: newConversations,
          currentConversationId: newCurrentId,
        };
      }),

      addMessage: (conversationId, message) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [...c.messages, message],
                updatedAt: Date.now(),
                // Update title from first user message
                title: c.messages.length === 0 && message.role === 'user'
                  ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                  : c.title,
              }
            : c
        ),
      })),

      updateMessage: (conversationId, messageId, content) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === messageId
                    ? { ...m, content, isStreaming: false }
                    : m
                ),
                updatedAt: Date.now(),
              }
            : c
        ),
      })),

      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      updateConversationTitle: (id, title) => set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === id ? { ...c, title } : c
        ),
      })),
    }),
    {
      name: 'ai-playground-conversations',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// RAG Store - Knowledge base
// ============================================================
interface RAGState {
  documents: Document[];
  collections: RAGCollection[];
  
  // Actions
  addDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  createCollection: (name: string) => string;
  deleteCollection: (id: string) => void;
  addDocumentToCollection: (documentId: string, collectionId: string) => void;
  removeDocumentFromCollection: (documentId: string, collectionId: string) => void;
}

export const useRAGStore = create<RAGState>()(
  persist(
    (set) => ({
      documents: [],
      collections: [],

      addDocument: (document) => set((state) => ({
        documents: [...state.documents, document],
      })),

      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        collections: state.collections.map((c) => ({
          ...c,
          documentIds: c.documentIds.filter((docId) => docId !== id),
        })),
      })),

      createCollection: (name) => {
        const id = crypto.randomUUID();
        set((state) => ({
          collections: [
            ...state.collections,
            { id, name, documentIds: [], createdAt: Date.now() },
          ],
        }));
        return id;
      },

      deleteCollection: (id) => set((state) => ({
        collections: state.collections.filter((c) => c.id !== id),
      })),

      addDocumentToCollection: (documentId, collectionId) => set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId && !c.documentIds.includes(documentId)
            ? { ...c, documentIds: [...c.documentIds, documentId] }
            : c
        ),
      })),

      removeDocumentFromCollection: (documentId, collectionId) => set((state) => ({
        collections: state.collections.map((c) =>
          c.id === collectionId
            ? { ...c, documentIds: c.documentIds.filter((id) => id !== documentId) }
            : c
        ),
      })),
    }),
    {
      name: 'ai-playground-rag',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Audio Store - Recordings and transcriptions
// ============================================================
interface AudioState {
  recordings: Recording[];
  transcriptions: Transcription[];
  
  // Actions
  addRecording: (recording: Recording) => void;
  deleteRecording: (id: string) => void;
  addTranscription: (transcription: Transcription) => void;
  deleteTranscription: (id: string) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      recordings: [],
      transcriptions: [],

      addRecording: (recording) => set((state) => ({
        recordings: [...state.recordings, recording],
      })),

      deleteRecording: (id) => set((state) => ({
        recordings: state.recordings.filter((r) => r.id !== id),
      })),

      addTranscription: (transcription) => set((state) => ({
        transcriptions: [transcription, ...state.transcriptions],
      })),

      deleteTranscription: (id) => set((state) => ({
        transcriptions: state.transcriptions.filter((t) => t.id !== id),
      })),
    }),
    {
      name: 'ai-playground-audio',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================================
// Spreadsheet Store - Data tables
// ============================================================
interface SpreadsheetState {
  spreadsheets: (SpreadsheetData & { id: string; name: string; createdAt: number })[];
  
  // Actions
  createSpreadsheet: (name: string, data: SpreadsheetData) => string;
  updateSpreadsheet: (id: string, data: Partial<SpreadsheetData>) => void;
  deleteSpreadsheet: (id: string) => void;
}

export const useSpreadsheetStore = create<SpreadsheetState>()(
  persist(
    (set) => ({
      spreadsheets: [],

      createSpreadsheet: (name, data) => {
        const id = crypto.randomUUID();
        set((state) => ({
          spreadsheets: [
            ...state.spreadsheets,
            { id, name, createdAt: Date.now(), ...data },
          ],
        }));
        return id;
      },

      updateSpreadsheet: (id, data) => set((state) => ({
        spreadsheets: state.spreadsheets.map((s) =>
          s.id === id ? { ...s, ...data } : s
        ),
      })),

      deleteSpreadsheet: (id) => set((state) => ({
        spreadsheets: state.spreadsheets.filter((s) => s.id !== id),
      })),
    }),
    {
      name: 'ai-playground-spreadsheets',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
