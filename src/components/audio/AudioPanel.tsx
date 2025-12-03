'use client';

import { useState } from 'react';
import { AudioRecorderComponent } from './AudioRecorder';
import { TranscriptionList } from './TranscriptionView';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Mic, FileText, Upload, Loader2 } from 'lucide-react';
import { useAudioStore } from '@/lib/store';

type Tab = 'record' | 'transcriptions' | 'upload';

export function AudioPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('record');
  const [isUploading, setIsUploading] = useState(false);
  const { addTranscription } = useAudioStore();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transcription failed');
      }

      addTranscription({
        ...result.data,
        audioFileName: file.name,
      });

      setActiveTab('transcriptions');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="w-5 h-5 text-[var(--accent-cyan)]" />
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Audio & Transcription
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-[var(--background-tertiary)]">
          <TabButton
            active={activeTab === 'record'}
            onClick={() => setActiveTab('record')}
            icon={<Mic className="w-4 h-4" />}
            label="Record"
          />
          <TabButton
            active={activeTab === 'transcriptions'}
            onClick={() => setActiveTab('transcriptions')}
            icon={<FileText className="w-4 h-4" />}
            label="Transcriptions"
          />
          <TabButton
            active={activeTab === 'upload'}
            onClick={() => setActiveTab('upload')}
            icon={<Upload className="w-4 h-4" />}
            label="Upload"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'record' && <AudioRecorderComponent />}
        
        {activeTab === 'transcriptions' && <TranscriptionList />}
        
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="text-center py-8 border-2 border-dashed border-[var(--border)] rounded-xl">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className={cn(
                  'cursor-pointer',
                  isUploading && 'pointer-events-none'
                )}
              >
                {isUploading ? (
                  <Loader2 className="w-10 h-10 mx-auto text-[var(--accent-cyan)] animate-spin mb-3" />
                ) : (
                  <Upload className="w-10 h-10 mx-auto text-[var(--foreground-muted)] mb-3" />
                )}
                <p className="text-[var(--foreground)] font-medium mb-1">
                  {isUploading ? 'Transcribing...' : 'Upload audio file'}
                </p>
                <p className="text-sm text-[var(--foreground-muted)]">
                  MP3, WAV, M4A, WEBM, OGG (max 25MB)
                </p>
              </label>
            </div>

            <div className="text-sm text-[var(--foreground-muted)]">
              <h3 className="font-medium text-[var(--foreground)] mb-2">
                Supported formats:
              </h3>
              <ul className="list-disc list-inside space-y-1">
                <li>MP3 - Most common audio format</li>
                <li>WAV - Uncompressed audio</li>
                <li>M4A - Apple audio format</li>
                <li>WEBM - Web audio format</li>
                <li>OGG - Open source format</li>
                <li>FLAC - Lossless audio</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
        active
          ? 'bg-[var(--background-secondary)] text-[var(--foreground)] shadow-sm'
          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)]'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

