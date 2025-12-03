'use client';

import { useRAGStore } from '@/lib/store';
import { FileUploader } from './FileUploader';
import { Button } from '@/components/ui/button';
import { cn, formatDate, formatFileSize } from '@/lib/utils';
import { 
  Database, 
  FileText, 
  Trash2, 
  Search,
  Plus,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';

export function KnowledgeBase() {
  const { documents, collections, deleteDocument, createCollection } = useRAGStore();
  const [showUploader, setShowUploader] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCollection = () => {
    const name = prompt('Enter collection name:');
    if (name) {
      createCollection(name);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[var(--accent-cyan)]" />
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Knowledge Base
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateCollection}
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              New Collection
            </Button>
            <Button
              size="sm"
              onClick={() => setShowUploader(!showUploader)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Documents
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground-subtle)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)] focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Uploader (collapsible) */}
        {showUploader && (
          <div className="mb-6 animate-slide-up">
            <FileUploader />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard 
            label="Documents" 
            value={documents.length} 
            icon={<FileText className="w-4 h-4" />}
          />
          <StatCard 
            label="Collections" 
            value={collections.length} 
            icon={<FolderOpen className="w-4 h-4" />}
          />
          <StatCard 
            label="Total Size" 
            value={formatFileSize(
              documents.reduce((acc, doc) => acc + (doc.content?.length || 0), 0)
            )} 
            icon={<Database className="w-4 h-4" />}
          />
        </div>

        {/* Collections */}
        {collections.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
              Collections
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {collections.map(collection => (
                <div
                  key={collection.id}
                  className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-[var(--accent-amber)]" />
                    <span className="text-sm font-medium text-[var(--foreground)]">
                      {collection.name}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    {collection.documentIds.length} documents
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents */}
        <div>
          <h3 className="text-sm font-medium text-[var(--foreground-muted)] mb-2">
            Documents ({filteredDocuments.length})
          </h3>
          
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-[var(--foreground-subtle)] mb-3" />
              <p className="text-[var(--foreground-muted)]">
                {documents.length === 0 
                  ? 'No documents yet. Upload some files to get started.'
                  : 'No documents match your search.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDocuments.map(doc => (
                <DocumentItem
                  key={doc.id}
                  document={doc}
                  onDelete={() => deleteDocument(doc.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string | number; 
  icon: React.ReactNode;
}) {
  return (
    <div className="p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]">
      <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function DocumentItem({ 
  document, 
  onDelete 
}: { 
  document: {
    id: string;
    name: string;
    type: string;
    createdAt: number;
    metadata: { wordCount?: number; pageCount?: number };
  };
  onDelete: () => void;
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'text-red-400';
      case 'docx': return 'text-blue-400';
      case 'pptx': return 'text-orange-400';
      case 'vtt': return 'text-green-400';
      default: return 'text-[var(--foreground-muted)]';
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors group">
      <FileText className={cn('w-5 h-5 flex-shrink-0', getTypeColor(document.type))} />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {document.name}
        </p>
        <p className="text-xs text-[var(--foreground-muted)]">
          {document.type.toUpperCase()}
          {document.metadata.wordCount && ` · ${document.metadata.wordCount} words`}
          {document.metadata.pageCount && ` · ${document.metadata.pageCount} pages`}
          {' · '}
          {formatDate(document.createdAt)}
        </p>
      </div>

      <button
        onClick={onDelete}
        className="p-2 rounded-lg text-[var(--foreground-muted)] hover:text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

