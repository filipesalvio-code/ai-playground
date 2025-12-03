# AI Playground - 6 Agent Parallel Build Orchestration

## Overview

This document provides the orchestration plan for building the AI Playground using 6 parallel Cursor agents with Git worktrees.

## Prerequisites

1. Foundation is committed to main branch
2. `.env.local` file created with your API keys (copy from `.env.example`)
3. 6 Cursor windows open on this project

## Agent Assignments

| Agent | Domain | Owned Directories |
|-------|--------|-------------------|
| Agent 1 | Core API | `src/lib/openrouter.ts`, `src/app/api/chat/`, `src/app/api/compare/` |
| Agent 2 | Chat UI | `src/components/chat/`, `src/components/sidebar/`, `src/app/page.tsx` |
| Agent 3 | RAG System | `src/lib/rag/`, `src/app/api/rag/`, `src/components/rag/` |
| Agent 4 | Audio | `src/lib/audio/`, `src/app/api/audio/`, `src/components/audio/` |
| Agent 5 | Search | `src/lib/deepsearch/`, `src/app/api/search/`, `src/app/api/deepsearch/`, `src/components/deepsearch/` |
| Agent 6 | Export | `src/lib/export/`, `src/lib/integrations/`, `src/app/api/export/`, `src/components/export/` |

---

## Agent Prompts

### Agent 1: Core API

```
Build the OpenRouter integration for the AI Playground:

1. Create `src/lib/openrouter.ts` with:
   - OpenRouter client using fetch
   - Streaming chat completions support
   - Error handling and retry logic
   - Request/response type safety
   
2. Create `src/app/api/chat/route.ts`:
   - POST endpoint for chat completions
   - Support streaming responses with ReadableStream
   - Accept model selection and messages array
   - Include RAG context if provided in request
   
3. Create `src/app/api/compare/route.ts`:
   - POST endpoint that accepts multiple models
   - Execute requests in parallel
   - Return combined streaming responses
   - Handle individual model failures gracefully

Use the types from `src/lib/types.ts` and models from `src/lib/models.ts`.
OpenRouter URL: https://openrouter.ai/api/v1/chat/completions
API Key header: Authorization: Bearer $OPENROUTER_API_KEY
```

### Agent 2: Chat UI

```
Build the chat interface components for AI Playground:

1. Create `src/components/sidebar/Sidebar.tsx`:
   - Collapsible sidebar (use sidebarOpen from useUIStore)
   - New chat button
   - Conversation list with titles
   - Delete conversation option
   - Click to switch conversations
   
2. Create `src/components/sidebar/ConversationList.tsx`:
   - List all conversations from useConversationsStore
   - Show title, date, model badge
   - Highlight active conversation
   - Smooth animations
   
3. Create `src/components/chat/ChatContainer.tsx`:
   - Main chat wrapper
   - Message list with auto-scroll
   - Handle empty state
   
4. Create `src/components/chat/MessageBubble.tsx`:
   - Different styles for user/assistant
   - Show model badge for assistant messages
   - Support markdown rendering
   - Copy button for messages
   
5. Create `src/components/chat/InputArea.tsx`:
   - Multi-line textarea with auto-resize
   - Send button with keyboard shortcut (Cmd/Ctrl+Enter)
   - File attachment button (placeholder)
   - Character count
   
6. Create `src/components/chat/ModelSelector.tsx`:
   - Dropdown showing all models from models.ts
   - Group by provider
   - Show provider colors/icons
   - Display current model selection

7. Update `src/app/page.tsx` to use these components

Use Tailwind with the CSS variables from globals.css.
Use shadcn/ui components from src/components/ui/.
Use Zustand stores from src/lib/store.ts.
```

### Agent 3: RAG System

```
Implement the RAG (Retrieval-Augmented Generation) system:

1. Create `src/lib/rag/parsers.ts`:
   - parsePDF: Use pdf-parse to extract text from PDF
   - parseDOCX: Use mammoth to extract text from DOCX
   - parseTXT: Read plain text files
   - parseVTT: Parse VTT subtitle files, extract text with timestamps
   - parsePPTX: Extract text from PowerPoint slides
   - Each parser should return: { text: string, metadata: object }
   
2. Create `src/lib/rag/chunker.ts`:
   - splitIntoChunks: Split text into chunks
   - Parameters: text, chunkSize (default 512 tokens), overlap (default 50)
   - Return array of chunks with start/end indices
   
3. Create `src/lib/rag/embeddings.ts`:
   - generateEmbedding: Generate embedding via OpenRouter
   - Use text-embedding-3-small model
   - Batch support for multiple texts
   
4. Create `src/lib/rag/vectordb.ts`:
   - Initialize LanceDB in data/ directory
   - createTable: Create new vector table
   - insertDocuments: Add documents with embeddings
   - search: Vector similarity search
   - deleteDocument: Remove document
   
5. Create `src/app/api/rag/upload/route.ts`:
   - POST endpoint accepting file upload
   - Parse file based on type
   - Chunk text
   - Generate embeddings
   - Store in LanceDB
   - Return document metadata
   
6. Create `src/app/api/rag/query/route.ts`:
   - POST endpoint with query text
   - Generate query embedding
   - Search LanceDB
   - Return top-k relevant chunks
   
7. Create `src/components/rag/FileUploader.tsx`:
   - Drag and drop zone
   - File type validation
   - Upload progress indicator
   - Success/error feedback
   
8. Create `src/components/rag/KnowledgeBase.tsx`:
   - List all documents in collections
   - Show document metadata
   - Delete documents
   - Toggle RAG for conversations

Use types from src/lib/types.ts.
Use useRAGStore from src/lib/store.ts.
```

### Agent 4: Audio & Transcription

```
Build audio recording and transcription features:

1. Create `src/lib/audio/recorder.ts`:
   - MediaRecorderWrapper class
   - Support microphone recording (getUserMedia)
   - Support system audio (getDisplayMedia with audio)
   - Start/stop/pause methods
   - onDataAvailable callback
   - Export as WebM or WAV
   
2. Create `src/lib/audio/screenCapture.ts`:
   - captureScreen: Use getDisplayMedia
   - Options for video+audio or audio-only
   - Handle permission requests
   - Return MediaStream
   
3. Create `src/lib/audio/whisper.ts`:
   - transcribeAudio: Send audio to OpenAI Whisper API
   - Support file upload and blob
   - Return transcription with segments and timestamps
   - Language detection
   
4. Create `src/app/api/audio/transcribe/route.ts`:
   - POST endpoint accepting audio file
   - Forward to Whisper API
   - Return transcription with segments
   
5. Create `src/components/audio/AudioRecorder.tsx`:
   - Recording mode selector (Mic/System/Screen)
   - Record button with visual feedback
   - Recording timer
   - Waveform visualization (optional)
   - Stop and save controls
   
6. Create `src/components/audio/ScreenRecorder.tsx`:
   - Screen/window selection
   - Preview of captured screen
   - Audio source indicator
   - Recording controls
   
7. Create `src/components/audio/TranscriptionView.tsx`:
   - Display transcription text
   - Clickable timestamps
   - Speaker labels if available
   - Export options (TXT, VTT, SRT)
   - Option to add to RAG knowledge base

Use types from src/lib/types.ts.
Use useAudioStore from src/lib/store.ts.
Use OpenAI API key from env for Whisper.
```

### Agent 5: Search & DeepSearch

```
Implement web search and DeepSearch research features:

1. Create `src/app/api/search/route.ts`:
   - POST endpoint with query
   - Use Perplexity sonar model via OpenRouter
   - Stream response with citations
   - Parse and return sources
   
2. Create `src/lib/deepsearch/researcher.ts`:
   - DeepSearchAgent class
   - breakdownQuestion: Use AI to generate 3-5 sub-questions
   - searchSubQuestion: Search each with Perplexity
   - synthesize: Combine results into coherent report
   - Return structured research with citations
   
3. Create `src/app/api/deepsearch/route.ts`:
   - POST endpoint with research question
   - Execute multi-step research
   - Stream progress updates
   - Return final synthesis with all sources
   
4. Create `src/components/deepsearch/DeepSearchPanel.tsx`:
   - Research question input
   - Progress indicator showing steps
   - Sub-questions display as they're generated
   - Individual search results
   
5. Create `src/components/deepsearch/ResearchReport.tsx`:
   - Formatted research report
   - Table of contents
   - Inline citations with hover preview
   - Source list with links
   - Export to PDF/Word button

Use Perplexity models from src/lib/models.ts (sonar-large-128k-online).
Use types from src/lib/types.ts.
Use useUIStore for deepSearchQuery state.
```

### Agent 6: Export & Integrations

```
Build the export system and third-party integrations:

1. Create `src/lib/export/toExcel.ts`:
   - exportToExcel: Use ExcelJS
   - Support tables with headers
   - Styling options
   - Return Blob
   
2. Create `src/lib/export/toPdf.ts`:
   - exportToPdf: Use jsPDF + html2canvas
   - Support formatted text
   - Include images
   - Return Blob
   
3. Create `src/lib/export/toWord.ts`:
   - exportToWord: Use docx package
   - Support headings, paragraphs, lists
   - Include images
   - Return Blob
   
4. Create `src/lib/export/toPpt.ts`:
   - exportToPpt: Use pptxgenjs
   - Create slides from content
   - Support titles, bullets, images
   - Return Blob
   
5. Create `src/lib/export/toImage.ts`:
   - exportToImage: Use html2canvas
   - Support JPG and PNG
   - Quality options
   - Return Blob
   
6. Create `src/app/api/export/[format]/route.ts`:
   - Dynamic route for all export formats
   - Accept content in request body
   - Return file download
   
7. Create `src/lib/integrations/gamma.ts`:
   - GammaClient class
   - createPresentation: Send prompt to Gamma API
   - Return presentation URL
   
8. Create `src/lib/integrations/consensus.ts`:
   - ConsensusClient class
   - searchPapers: Search academic papers
   - Return paper metadata and summaries
   
9. Create `src/components/export/ExportMenu.tsx`:
   - Dropdown menu with format options
   - Icons for each format
   - Loading state during export
   - Download trigger
   
10. Create `src/components/integrations/GammaPanel.tsx`:
    - Input for presentation prompt
    - Generate button
    - Preview/link to Gamma
    
11. Create `src/components/integrations/ConsensusSearch.tsx`:
    - Academic search input
    - Paper results display
    - Cite in chat button

Use types from src/lib/types.ts.
Use downloadBlob from src/lib/utils.ts.
```

---

## How to Run Parallel Agents

1. **In each Cursor window:**
   - Open the Agent panel (Cmd/Ctrl + L)
   - Click the dropdown next to submit
   - Select **"Run in worktree"**
   - Paste the corresponding agent prompt
   - Submit

2. **Monitor progress:**
   - Each agent works in isolation
   - Check the "Worktrees Setup" output for any issues
   - Agents can run simultaneously

3. **Apply changes:**
   - When an agent completes, click **"Apply"**
   - Review the changes
   - If conflicts, use merge or full overwrite
   - Repeat for each agent

4. **Integration testing:**
   - After all agents are applied
   - Run `npm run dev`
   - Test each feature
   - Fix any integration issues

---

## Dependency Order

Some agents have dependencies:

```
Phase 1 (No dependencies):
├── Agent 1: Core API (foundation for all API calls)
├── Agent 2: Chat UI (uses stores, needs API)
└── Agent 3: RAG System (independent)

Phase 2 (After Phase 1):
├── Agent 4: Audio (independent, uses Whisper)
├── Agent 5: Search (needs API client pattern)
└── Agent 6: Export (mostly independent)
```

For best results, start Agents 1, 2, and 3 first, then 4, 5, and 6.

---

## Post-Build Checklist

- [ ] All agents applied successfully
- [ ] No TypeScript errors (`npm run build`)
- [ ] Chat works with OpenRouter
- [ ] Model switching works
- [ ] File upload parses documents
- [ ] Audio recording works
- [ ] Transcription works
- [ ] Search returns citations
- [ ] DeepSearch generates reports
- [ ] Export creates valid files
- [ ] UI is responsive and polished

