import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const WHISPER_API_URL = 'https://api.openai.com/v1/audio/transcriptions';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const language = formData.get('language') as string | null;

    if (!file) {
      return Response.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Check file size (max 25MB for Whisper)
    if (file.size > 25 * 1024 * 1024) {
      return Response.json(
        { error: 'File too large. Maximum size is 25MB' },
        { status: 400 }
      );
    }

    // Forward to Whisper API
    const whisperFormData = new FormData();
    whisperFormData.append('file', file);
    whisperFormData.append('model', 'whisper-1');
    whisperFormData.append('response_format', 'verbose_json');
    
    if (language) {
      whisperFormData.append('language', language);
    }

    const response = await fetch(WHISPER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Whisper API error:', error);
      return Response.json(
        { error: 'Transcription failed. Please try again.' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Format response
    const transcription = {
      id: crypto.randomUUID(),
      text: data.text,
      segments: data.segments?.map((seg: {
        id: number;
        start: number;
        end: number;
        text: string;
      }) => ({
        id: seg.id,
        start: seg.start,
        end: seg.end,
        text: seg.text.trim(),
      })) || [],
      language: data.language || 'en',
      duration: data.duration || 0,
      createdAt: Date.now(),
    };

    return Response.json({
      success: true,
      data: transcription,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    
    return Response.json(
      { 
        error: error instanceof Error ? error.message : 'Transcription failed' 
      },
      { status: 500 }
    );
  }
}

