export type RecordingSource = 'microphone' | 'system_audio' | 'screen';

interface RecorderOptions {
  source: RecordingSource;
  mimeType?: string;
  audioBitsPerSecond?: number;
}

interface RecorderCallbacks {
  onStart?: () => void;
  onStop?: (blob: Blob) => void;
  onDataAvailable?: (blob: Blob) => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (seconds: number) => void;
}

/**
 * MediaRecorder wrapper for audio/screen recording
 */
export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private timerInterval: NodeJS.Timeout | null = null;
  private callbacks: RecorderCallbacks = {};
  private options: RecorderOptions;

  constructor(options: RecorderOptions) {
    this.options = options;
  }

  /**
   * Set callback functions
   */
  setCallbacks(callbacks: RecorderCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * Get supported MIME type
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm';
  }

  /**
   * Request media stream based on source
   */
  private async getMediaStream(): Promise<MediaStream> {
    const { source } = this.options;

    switch (source) {
      case 'microphone':
        return navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
          video: false,
        });

      case 'system_audio':
        // System audio requires getDisplayMedia with audio
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // Required even if we only want audio
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        
        // Extract only audio tracks
        const audioTracks = displayStream.getAudioTracks();
        if (audioTracks.length === 0) {
          displayStream.getTracks().forEach(track => track.stop());
          throw new Error('No audio track available. Make sure to check "Share audio" when selecting the screen.');
        }
        
        // Stop video tracks
        displayStream.getVideoTracks().forEach(track => track.stop());
        
        return new MediaStream(audioTracks);

      case 'screen':
        // Full screen capture with audio
        return navigator.mediaDevices.getDisplayMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });

      default:
        throw new Error(`Unknown recording source: ${source}`);
    }
  }

  /**
   * Start recording
   */
  async start(): Promise<void> {
    try {
      this.mediaStream = await this.getMediaStream();
      
      const mimeType = this.options.mimeType || this.getSupportedMimeType();
      
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
        audioBitsPerSecond: this.options.audioBitsPerSecond || 128000,
      });

      this.chunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
          this.callbacks.onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: mimeType });
        this.callbacks.onStop?.(blob);
        this.cleanup();
      };

      this.mediaRecorder.onerror = (event) => {
        this.callbacks.onError?.(new Error('Recording error'));
        this.cleanup();
      };

      // Start recording with 1 second intervals
      this.mediaRecorder.start(1000);
      this.callbacks.onStart?.();

      // Start timer
      this.timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.callbacks.onTimeUpdate?.(elapsed);
      }, 1000);

    } catch (error) {
      this.callbacks.onError?.(
        error instanceof Error ? error : new Error('Failed to start recording')
      );
      this.cleanup();
      throw error;
    }
  }

  /**
   * Stop recording
   */
  stop(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  /**
   * Pause recording
   */
  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  /**
   * Resume recording
   */
  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  /**
   * Get current recording state
   */
  getState(): RecordingState | null {
    return this.mediaRecorder?.state || null;
  }

  /**
   * Clean up resources
   */
  private cleanup(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    this.mediaRecorder = null;
  }

  /**
   * Check if recording is supported
   */
  static isSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof window !== 'undefined' &&
      window.MediaRecorder
    );
  }

  /**
   * Check if screen capture is supported
   */
  static isScreenCaptureSupported(): boolean {
    return !!(
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === 'function'
    );
  }
}

/**
 * Convert blob to base64
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Convert blob to array buffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return blob.arrayBuffer();
}

/**
 * Create audio element from blob
 */
export function createAudioElement(blob: Blob): HTMLAudioElement {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  return audio;
}

