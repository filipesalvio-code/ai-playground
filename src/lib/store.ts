import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Conversation,
  Message,
  Collection,
  Document,
  Recording,
  Transcription,
  ViewMode,
  Settings,
  DeepSearchQuery,
} from './types';

// ============================================
// CONVERSATIONS STORE
// ============================================

interface ConversationsState {
  conversations: Conversation[];
  currentConversationId: string | null;
  
  // Actions
  createConversation: (model: string) => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string | null) => void;
  getCurrentConversation: () => Conversation | null;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, content: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setConversationModel: (id: string, model: string) => void;
  toggleRAG: (id: string) => void;
  setCollections: (id: string, collectionIds: string[]) => void;
}

export const useConversationsStore = create<ConversationsState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,

      createConversation: (model: string) => {
        const id = crypto.randomUUID();
        const conversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          model,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ragEnabled: false,
          collectionIds: [],
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          currentConversationId:
            state.currentConversationId === id ? null : state.currentConversationId,
        }));
      },

      setCurrentConversation: (id: string | null) => {
        set({ currentConversationId: id });
      },

      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },

      addMessage: (conversationId: string, message: Message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now(),
                  title: c.messages.length === 0 && message.role === 'user' 
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : c.title,
                }
              : c
          ),
        }));
      },

      updateMessage: (conversationId: string, messageId: string, content: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content, isStreaming: false } : m
                  ),
                  updatedAt: Date.now(),
                }
              : c
          ),
        }));
      },

      updateConversationTitle: (id: string, title: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      setConversationModel: (id: string, model: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, model, updatedAt: Date.now() } : c
          ),
        }));
      },

      toggleRAG: (id: string) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ragEnabled: !c.ragEnabled, updatedAt: Date.now() } : c
          ),
        }));
      },

      setCollections: (id: string, collectionIds: string[]) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, collectionIds, updatedAt: Date.now() } : c
          ),
        }));
      },
    }),
    {
      name: 'ai-playground-conversations',
    }
  )
);

// ============================================
// RAG STORE
// ============================================

interface RAGState {
  collections: Collection[];
  documents: Document[];
  
  // Actions
  createCollection: (name: string, description?: string) => string;
  deleteCollection: (id: string) => void;
  updateCollection: (id: string, updates: Partial<Collection>) => void;
  addDocument: (document: Document) => void;
  deleteDocument: (id: string) => void;
  addDocumentToCollection: (collectionId: string, documentId: string) => void;
  removeDocumentFromCollection: (collectionId: string, documentId: string) => void;
}

export const useRAGStore = create<RAGState>()(
  persist(
    (set) => ({
      collections: [],
      documents: [],

      createCollection: (name: string, description?: string) => {
        const id = crypto.randomUUID();
        const collection: Collection = {
          id,
          name,
          description,
          documentIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          collections: [...state.collections, collection],
        }));
        return id;
      },

      deleteCollection: (id: string) => {
        set((state) => ({
          collections: state.collections.filter((c) => c.id !== id),
        }));
      },

      updateCollection: (id: string, updates: Partial<Collection>) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
          ),
        }));
      },

      addDocument: (document: Document) => {
        set((state) => ({
          documents: [...state.documents, document],
        }));
      },

      deleteDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter((d) => d.id !== id),
          collections: state.collections.map((c) => ({
            ...c,
            documentIds: c.documentIds.filter((docId) => docId !== id),
          })),
        }));
      },

      addDocumentToCollection: (collectionId: string, documentId: string) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId && !c.documentIds.includes(documentId)
              ? { ...c, documentIds: [...c.documentIds, documentId], updatedAt: Date.now() }
              : c
          ),
        }));
      },

      removeDocumentFromCollection: (collectionId: string, documentId: string) => {
        set((state) => ({
          collections: state.collections.map((c) =>
            c.id === collectionId
              ? { ...c, documentIds: c.documentIds.filter((id) => id !== documentId), updatedAt: Date.now() }
              : c
          ),
        }));
      },
    }),
    {
      name: 'ai-playground-rag',
    }
  )
);

// ============================================
// AUDIO STORE
// ============================================

interface AudioState {
  recordings: Recording[];
  transcriptions: Transcription[];
  isRecording: boolean;
  recordingSource: 'microphone' | 'system_audio' | 'screen' | null;
  
  // Actions
  addRecording: (recording: Recording) => void;
  deleteRecording: (id: string) => void;
  addTranscription: (transcription: Transcription) => void;
  deleteTranscription: (id: string) => void;
  setRecording: (isRecording: boolean, source?: 'microphone' | 'system_audio' | 'screen' | null) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      recordings: [],
      transcriptions: [],
      isRecording: false,
      recordingSource: null,

      addRecording: (recording: Recording) => {
        set((state) => ({
          recordings: [...state.recordings, recording],
        }));
      },

      deleteRecording: (id: string) => {
        set((state) => ({
          recordings: state.recordings.filter((r) => r.id !== id),
        }));
      },

      addTranscription: (transcription: Transcription) => {
        set((state) => ({
          transcriptions: [...state.transcriptions, transcription],
        }));
      },

      deleteTranscription: (id: string) => {
        set((state) => ({
          transcriptions: state.transcriptions.filter((t) => t.id !== id),
        }));
      },

      setRecording: (isRecording: boolean, source = null) => {
        set({ isRecording, recordingSource: source });
      },
    }),
    {
      name: 'ai-playground-audio',
      partialize: (state) => ({
        recordings: state.recordings.map((r) => ({ ...r, blob: undefined })),
        transcriptions: state.transcriptions,
      }),
    }
  )
);

// ============================================
// UI STORE
// ============================================

interface UIStore {
  sidebarOpen: boolean;
  currentView: ViewMode;
  selectedModel: string;
  compareModels: string[];
  deepSearchQuery: DeepSearchQuery | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: ViewMode) => void;
  setSelectedModel: (model: string) => void;
  setCompareModels: (models: string[]) => void;
  setDeepSearchQuery: (query: DeepSearchQuery | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentView: 'chat',
      selectedModel: 'openai/gpt-4o',
      compareModels: ['openai/gpt-4o', 'anthropic/claude-3.5-sonnet'],
      deepSearchQuery: null,

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setCurrentView: (view: ViewMode) => {
        set({ currentView: view });
      },

      setSelectedModel: (model: string) => {
        set({ selectedModel: model });
      },

      setCompareModels: (models: string[]) => {
        set({ compareModels: models });
      },

      setDeepSearchQuery: (query: DeepSearchQuery | null) => {
        set({ deepSearchQuery: query });
      },
    }),
    {
      name: 'ai-playground-ui',
    }
  )
);

// ============================================
// SETTINGS STORE
// ============================================

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void;
  resetSettings: () => void;
}

const defaultSettings: Settings = {
  theme: 'dark',
  defaultModel: 'openai/gpt-4o',
  streamResponses: true,
  autoSaveConversations: true,
  showTokenCount: true,
  maxContextMessages: 20,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,

      updateSettings: (settings: Partial<Settings>) => {
        set((state) => ({ ...state, ...settings }));
      },

      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'ai-playground-settings',
    }
  )
);

