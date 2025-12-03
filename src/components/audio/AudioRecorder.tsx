'use client';

import { useState, useCallback } from 'react';
import { useAudioStore } from '@/lib/store';
import { AudioRecorder as Recorder } from '@/lib/audio/recorder';
import { Button } from '@/components/ui/button';
import { cn, formatDuration } from '@/lib/utils';
import { 
  Mic, 
  Monitor, 
  Volume2, 
  Square, 
  Pause, 
  Play,
  Upload,
  Loader2
} from 'lucide-react';

type RecordingMode = 'microphone' | 'system_audio' | 'screen';

export function AudioRecorderComponent() {
  const [mode, setMode] = useState<RecordingMode>('microphone');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recorder, setRecorder] = useState<Recorder | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const { addRecording, addTranscription } = useAudioStore();

  const startRecording = useCallback(async () => {
    try {
      const newRecorder = new Recorder({ source: mode });
      
      newRecorder.setCallbacks({
        onStart: () => {
          setIsRecording(true);
          setIsPaused(false);
          setDuration(0);
        },
        onStop: (blob) => {
          setRecordedBlob(blob);
          setIsRecording(false);
          setIsPaused(false);
        },
        onTimeUpdate: (seconds) => {
          setDuration(seconds);
        },
        onError: (error) => {
          console.error('Recording error:', error);
          alert(error.message);
          setIsRecording(false);
        },
      });

      await newRecorder.start();
      setRecorder(newRecorder);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert(error instanceof Error ? error.message : 'Failed to start recording');
    }
  }, [mode]);

  const stopRecording = useCallback(() => {
    recorder?.stop();
    setRecorder(null);
  }, [recorder]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      recorder?.resume();
    } else {
      recorder?.pause();
    }
    setIsPaused(!isPaused);
  }, [recorder, isPaused]);

  const transcribeRecording = useCallback(async () => {
    if (!recordedBlob) return;

    setIsTranscribing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', recordedBlob, 'recording.webm');

      const response = await fetch('/api/audio/transcribe', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Transcription failed');
      }

      // Save recording
      const recording = {
        id: crypto.randomUUID(),
        name: `Recording ${new Date().toLocaleString()}`,
        source: mode,
        duration,
        size: recordedBlob.size,
        mimeType: recordedBlob.type,
        createdAt: Date.now(),
      };
      addRecording(recording);

      // Save transcription
      addTranscription({
        ...result.data,
        recordingId: recording.id,
      });

      // Clear recorded blob
      setRecordedBlob(null);
      setDuration(0);
      
      alert('Transcription complete!');
    } catch (error) {
      console.error('Transcription error:', error);
      alert(error instanceof Error ? error.message : 'Transcription failed');
    } finally {
      setIsTranscribing(false);
    }
  }, [recordedBlob, mode, duration, addRecording, addTranscription]);

  const discardRecording = useCallback(() => {
    setRecordedBlob(null);
    setDuration(0);
  }, []);

  return (
    <div className="space-y-6">
      {/* Mode Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--foreground)]">
          Recording Source
        </label>
        <div className="grid grid-cols-3 gap-2">
          <ModeButton
            mode="microphone"
            currentMode={mode}
            onSelect={setMode}
            icon={<Mic className="w-5 h-5" />}
            label="Microphone"
            disabled={isRecording}
          />
          <ModeButton
            mode="system_audio"
            currentMode={mode}
            onSelect={setMode}
            icon={<Volume2 className="w-5 h-5" />}
            label="System Audio"
            disabled={isRecording}
          />
          <ModeButton
            mode="screen"
            currentMode={mode}
            onSelect={setMode}
            icon={<Monitor className="w-5 h-5" />}
            label="Screen + Audio"
            disabled={isRecording}
          />
        </div>
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col items-center space-y-4">
        {/* Timer */}
        <div className={cn(
          'text-4xl font-mono tabular-nums',
          isRecording ? 'text-[var(--error)]' : 'text-[var(--foreground)]'
        )}>
          {formatDuration(duration)}
        </div>

        {/* Waveform Placeholder */}
        {isRecording && (
          <div className="flex items-center gap-1 h-12">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[var(--accent-cyan)] rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 50}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center gap-4">
          {!isRecording && !recordedBlob && (
            <Button
              size="lg"
              onClick={startRecording}
              className="w-16 h-16 rounded-full bg-[var(--error)] hover:bg-[var(--error)]/90"
            >
              <Mic className="w-6 h-6" />
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={togglePause}
                className="w-12 h-12 rounded-full"
              >
                {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </Button>
              <Button
                size="lg"
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-[var(--error)] hover:bg-[var(--error)]/90"
              >
                <Square className="w-6 h-6" />
              </Button>
            </>
          )}

          {recordedBlob && !isRecording && (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={discardRecording}
              >
                Discard
              </Button>
              <Button
                onClick={transcribeRecording}
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Transcribe
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-[var(--foreground-muted)]">
        {mode === 'microphone' && 'Click the button to start recording from your microphone'}
        {mode === 'system_audio' && 'Select a tab or window to capture its audio'}
        {mode === 'screen' && 'Select a screen or window to record with audio'}
      </div>
    </div>
  );
}

function ModeButton({
  mode,
  currentMode,
  onSelect,
  icon,
  label,
  disabled,
}: {
  mode: RecordingMode;
  currentMode: RecordingMode;
  onSelect: (mode: RecordingMode) => void;
  icon: React.ReactNode;
  label: string;
  disabled: boolean;
}) {
  const isActive = mode === currentMode;
  
  return (
    <button
      onClick={() => onSelect(mode)}
      disabled={disabled}
      className={cn(
        'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
        isActive
          ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
          : 'border-[var(--border)] bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:border-[var(--border-light)]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

