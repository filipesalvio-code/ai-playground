'use client';

import { useState } from 'react';
import { useAudioStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { cn, formatDuration, formatDate, downloadBlob } from '@/lib/utils';
import { toVTT, toSRT } from '@/lib/audio/whisper';
import type { Transcription } from '@/lib/types';
import { 
  FileText, 
  Download, 
  Copy, 
  Check,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function TranscriptionList() {
  const { transcriptions, deleteTranscription } = useAudioStore();

  if (transcriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 mx-auto text-[var(--foreground-subtle)] mb-3" />
        <p className="text-[var(--foreground-muted)]">
          No transcriptions yet. Record or upload audio to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transcriptions.map((transcription) => (
        <TranscriptionItem
          key={transcription.id}
          transcription={transcription}
          onDelete={() => deleteTranscription(transcription.id)}
        />
      ))}
    </div>
  );
}

function TranscriptionItem({
  transcription,
  onDelete,
}: {
  transcription: Transcription;
  onDelete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(transcription.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (format: 'txt' | 'vtt' | 'srt') => {
    let content: string;
    let filename: string;
    let mimeType: string;

    switch (format) {
      case 'vtt':
        content = toVTT(transcription);
        filename = `transcription-${transcription.id}.vtt`;
        mimeType = 'text/vtt';
        break;
      case 'srt':
        content = toSRT(transcription);
        filename = `transcription-${transcription.id}.srt`;
        mimeType = 'text/srt';
        break;
      default:
        content = transcription.text;
        filename = `transcription-${transcription.id}.txt`;
        mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    downloadBlob(blob, filename);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background-secondary)] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[var(--background-tertiary)] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <FileText className="w-5 h-5 text-[var(--accent-cyan)] flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--foreground)] truncate">
            {transcription.text.slice(0, 60)}...
          </p>
          <div className="flex items-center gap-3 text-xs text-[var(--foreground-muted)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(transcription.duration)}
            </span>
            <span>{transcription.language.toUpperCase()}</span>
            <span>{formatDate(transcription.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-[var(--success)]" />
            ) : (
              <Copy className="w-4 h-4 text-[var(--foreground-muted)]" />
            )}
          </button>
          
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[var(--foreground-muted)]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--foreground-muted)]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[var(--border)]">
          {/* Full Text */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">
              {transcription.text}
            </p>
          </div>

          {/* Segments */}
          {transcription.segments.length > 0 && (
            <div className="border-t border-[var(--border)] p-4">
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-2">
                Segments ({transcription.segments.length})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {transcription.segments.map((segment) => (
                  <div
                    key={segment.id}
                    className="flex gap-3 text-sm"
                  >
                    <span className="text-[var(--accent-cyan)] font-mono text-xs w-20 flex-shrink-0">
                      {formatDuration(segment.start)}
                    </span>
                    <span className="text-[var(--foreground)]">
                      {segment.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--background-tertiary)]">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--foreground-muted)]">Export:</span>
              <Button size="sm" variant="outline" onClick={() => handleExport('txt')}>
                TXT
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('vtt')}>
                VTT
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleExport('srt')}>
                SRT
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              className="text-[var(--error)] hover:text-[var(--error)] hover:bg-[var(--error)]/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

