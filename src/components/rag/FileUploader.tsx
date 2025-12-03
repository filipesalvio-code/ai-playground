'use client';

import { useState, useCallback } from 'react';
import { useRAGStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn, formatFileSize } from '@/lib/utils';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const SUPPORTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/vtt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];

const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'txt', 'md', 'vtt', 'pptx'];

interface UploadedFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  documentId?: string;
  error?: string;
  chunkCount?: number;
}

export function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { addDocument } = useRAGStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    e.target.value = ''; // Reset input
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension && SUPPORTED_EXTENSIONS.includes(extension);
    });

    const uploadFiles: UploadedFile[] = validFiles.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...uploadFiles]);

    // Start uploading
    uploadFiles.forEach(uploadFile => {
      uploadSingleFile(uploadFile.file);
    });
  };

  const uploadSingleFile = async (file: File) => {
    // Update status to uploading
    setFiles(prev => prev.map(f => 
      f.file === file ? { ...f, status: 'uploading', progress: 10 } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/rag/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update with success
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { 
              ...f, 
              status: 'success', 
              progress: 100,
              documentId: result.data.documentId,
              chunkCount: result.data.chunkCount,
            } 
          : f
      ));

      // Add to store
      addDocument({
        id: result.data.documentId,
        name: file.name,
        type: result.data.type,
        content: '', // Content stored in vector DB
        metadata: {
          source: 'upload',
          originalName: file.name,
          wordCount: result.data.wordCount,
          pageCount: result.data.pageCount,
        },
        createdAt: Date.now(),
      });

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.file === file 
          ? { 
              ...f, 
              status: 'error', 
              progress: 0,
              error: error instanceof Error ? error.message : 'Upload failed',
            } 
          : f
      ));
    }
  };

  const removeFile = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer',
          isDragging
            ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/5'
            : 'border-[var(--border)] hover:border-[var(--border-light)] hover:bg-[var(--background-tertiary)]/50'
        )}
      >
        <input
          type="file"
          multiple
          accept={SUPPORTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className={cn(
          'w-10 h-10 mx-auto mb-3 transition-colors',
          isDragging ? 'text-[var(--accent-cyan)]' : 'text-[var(--foreground-muted)]'
        )} />
        
        <p className="text-[var(--foreground)] font-medium mb-1">
          Drop files here or click to upload
        </p>
        <p className="text-sm text-[var(--foreground-muted)]">
          Supports PDF, DOCX, TXT, VTT, PPTX (max 10MB)
        </p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-[var(--foreground)]">
              Uploaded Files
            </h3>
            {files.some(f => f.status === 'success') && (
              <button
                onClick={clearCompleted}
                className="text-xs text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-2">
            {files.map((uploadFile, index) => (
              <FileItem
                key={`${uploadFile.file.name}-${index}`}
                uploadFile={uploadFile}
                onRemove={() => removeFile(uploadFile.file)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FileItem({ 
  uploadFile, 
  onRemove 
}: { 
  uploadFile: UploadedFile; 
  onRemove: () => void;
}) {
  const { file, status, error, chunkCount } = uploadFile;
  
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)]">
      <File className="w-5 h-5 text-[var(--foreground-muted)] flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--foreground)] truncate">{file.name}</p>
        <p className="text-xs text-[var(--foreground-muted)]">
          {formatFileSize(file.size)}
          {chunkCount && ` · ${chunkCount} chunks`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {status === 'uploading' && (
          <Loader2 className="w-4 h-4 text-[var(--accent-cyan)] animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle className="w-4 h-4 text-[var(--success)]" />
        )}
        {status === 'error' && (
          <div className="flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-[var(--error)]" />
            <span className="text-xs text-[var(--error)]">{error}</span>
          </div>
        )}
        
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-[var(--background-tertiary)] transition-colors"
        >
          <X className="w-4 h-4 text-[var(--foreground-muted)]" />
        </button>
      </div>
    </div>
  );
}

