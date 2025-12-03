import type { Transcription, TranscriptionSegment } from '../types';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

interface WhisperOptions {
  language?: string;
  prompt?: string;
  temperature?: number;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

interface WhisperResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: {
    id: number;
    seek: number;
    start: number;
    end: number;
    text: string;
    tokens: number[];
    temperature: number;
    avg_logprob: number;
    compression_ratio: number;
    no_speech_prob: number;
  }[];
}

/**
 * Transcribe audio using OpenAI Whisper API
 */
export async function transcribeAudio(
  audioFile: File | Blob,
  options: WhisperOptions = {}
): Promise<Transcription> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured for transcription');
  }

  const formData = new FormData();
  
  // Add file
  if (audioFile instanceof File) {
    formData.append('file', audioFile);
  } else {
    formData.append('file', audioFile, 'audio.webm');
  }
  
  formData.append('model', 'whisper-1');
  formData.append('response_format', options.response_format || 'verbose_json');
  
  if (options.language) {
    formData.append('language', options.language);
  }
  if (options.prompt) {
    formData.append('prompt', options.prompt);
  }
  if (options.temperature !== undefined) {
    formData.append('temperature', options.temperature.toString());
  }

  const response = await fetch(WHISPER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const data: WhisperResponse = await response.json();

  // Convert to our Transcription format
  const segments: TranscriptionSegment[] = data.segments?.map(seg => ({
    id: seg.id,
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  })) || [];

  return {
    id: crypto.randomUUID(),
    text: data.text,
    segments,
    language: data.language || 'en',
    duration: data.duration || 0,
    createdAt: Date.now(),
  };
}

/**
 * Server-side transcription function
 */
export async function transcribeAudioServer(
  audioBuffer: Buffer,
  filename: string,
  options: WhisperOptions = {}
): Promise<Transcription> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  // Create form data with buffer - convert to Uint8Array for compatibility
  const formData = new FormData();
  const uint8Array = new Uint8Array(audioBuffer);
  const blob = new Blob([uint8Array], { type: 'audio/webm' });
  formData.append('file', blob, filename);
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  
  if (options.language) {
    formData.append('language', options.language);
  }

  const response = await fetch(WHISPER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Whisper API error: ${response.status} - ${error}`);
  }

  const data: WhisperResponse = await response.json();

  const segments: TranscriptionSegment[] = data.segments?.map(seg => ({
    id: seg.id,
    start: seg.start,
    end: seg.end,
    text: seg.text.trim(),
  })) || [];

  return {
    id: crypto.randomUUID(),
    text: data.text,
    segments,
    language: data.language || 'en',
    duration: data.duration || 0,
    createdAt: Date.now(),
  };
}

/**
 * Convert transcription to VTT format
 */
export function toVTT(transcription: Transcription): string {
  const lines = ['WEBVTT', ''];

  for (const segment of transcription.segments) {
    const startTime = formatTimestamp(segment.start);
    const endTime = formatTimestamp(segment.end);
    lines.push(`${startTime} --> ${endTime}`);
    lines.push(segment.text);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Convert transcription to SRT format
 */
export function toSRT(transcription: Transcription): string {
  const lines: string[] = [];

  for (let i = 0; i < transcription.segments.length; i++) {
    const segment = transcription.segments[i];
    const startTime = formatTimestampSRT(segment.start);
    const endTime = formatTimestampSRT(segment.end);
    
    lines.push((i + 1).toString());
    lines.push(`${startTime} --> ${endTime}`);
    lines.push(segment.text);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format seconds to VTT timestamp (HH:MM:SS.mmm)
 */
function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
}

/**
 * Format seconds to SRT timestamp (HH:MM:SS,mmm)
 */
function formatTimestampSRT(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

