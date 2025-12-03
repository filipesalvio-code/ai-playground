# AI Playground

A comprehensive AI research and productivity platform that unifies multiple AI models (ChatGPT, Claude, Gemini, Grok, Perplexity) into a single, powerful interface.

## Features

- **Multi-Model Chat** - Access GPT-4, Claude, Gemini, Grok, and more through OpenRouter
- **Model Comparison** - Compare responses from multiple models side-by-side
- **RAG System** - Upload documents (PDF, DOCX, TXT, VTT, PPTX) for context-aware responses
- **Web Crawling** - Crawl and index websites for your knowledge base
- **DeepSearch** - Multi-step research with synthesized reports and citations
- **Audio Recording** - Record microphone, system audio, or screen (for meetings)
- **Transcription** - Convert audio to text with OpenAI Whisper
- **Spreadsheet Creation** - Generate Excel files and Google Sheets
- **Multi-Format Export** - Export to Excel, PDF, Word, PowerPoint, and images
- **Gamma Integration** - Generate presentations with AI
- **Consensus Integration** - Search academic papers

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **AI API**: OpenRouter (unified model access)
- **Vector DB**: LanceDB (embedded)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **UI Components**: Radix UI / shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenRouter API key
- OpenAI API key (for Whisper transcription)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-playground

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your API keys
```

### Environment Variables

Create a `.env.local` file with:

```env
# Required
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENAI_API_KEY=sk-your-key-here

# Optional
GOOGLE_SHEETS_CLIENT_EMAIL=
GOOGLE_SHEETS_PRIVATE_KEY=
GAMMA_API_KEY=
CONSENSUS_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── chat/          # Chat completion
│   │   ├── compare/       # Model comparison
│   │   ├── search/        # Web search
│   │   ├── deepsearch/    # Research agent
│   │   ├── rag/           # RAG operations
│   │   ├── audio/         # Transcription
│   │   └── export/        # File exports
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat/              # Chat interface
│   ├── sidebar/           # Navigation
│   ├── comparison/        # Model comparison
│   ├── rag/               # Knowledge base
│   ├── audio/             # Recording/transcription
│   ├── deepsearch/        # Research UI
│   ├── export/            # Export menu
│   ├── integrations/      # Gamma, Consensus
│   └── ui/                # Base components
├── lib/
│   ├── openrouter.ts      # OpenRouter client
│   ├── models.ts          # Model definitions
│   ├── types.ts           # TypeScript types
│   ├── store.ts           # Zustand stores
│   ├── utils.ts           # Utilities
│   ├── rag/               # RAG logic
│   ├── audio/             # Audio handling
│   ├── deepsearch/        # Research agent
│   ├── export/            # Export functions
│   └── integrations/      # Third-party APIs
└── data/                  # LanceDB storage
```

## Parallel Development

This project is designed for parallel development using Cursor's worktree feature. See `ORCHESTRATION.md` for the 6-agent build plan.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

## API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| OpenRouter | All AI models | [openrouter.ai/keys](https://openrouter.ai/keys) |
| OpenAI | Whisper transcription | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Google Cloud | Sheets API | [console.cloud.google.com](https://console.cloud.google.com) |
| Gamma | Presentations | [gamma.app](https://gamma.app) |
| Consensus | Academic search | [consensus.app](https://consensus.app) |

## License

MIT

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.
