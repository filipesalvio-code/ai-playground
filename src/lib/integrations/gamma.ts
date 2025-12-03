/**
 * Gamma App Integration
 * https://gamma.app - AI-powered presentations
 */

interface GammaConfig {
  apiKey?: string;
}

interface GeneratePresentationOptions {
  topic: string;
  outline?: string[];
  style?: 'professional' | 'creative' | 'minimal';
  numSlides?: number;
}

interface GammaPresentation {
  id: string;
  title: string;
  url: string;
  slides: number;
  createdAt: Date;
}

/**
 * Gamma API client for presentation generation
 * Note: Gamma may not have a public API - this is a placeholder
 * for when/if they release one
 */
export class GammaClient {
  private apiKey: string | null;
  private baseUrl = 'https://api.gamma.app';

  constructor(config: GammaConfig = {}) {
    this.apiKey = config.apiKey || process.env.GAMMA_API_KEY || null;
  }

  /**
   * Check if Gamma integration is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Generate a presentation using Gamma
   */
  async generatePresentation(
    options: GeneratePresentationOptions
  ): Promise<GammaPresentation> {
    if (!this.apiKey) {
      throw new Error('Gamma API key not configured');
    }

    // Note: This is a placeholder implementation
    // Actual implementation depends on Gamma's API

    const response = await fetch(`${this.baseUrl}/v1/presentations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: options.topic,
        outline: options.outline,
        style: options.style || 'professional',
        num_slides: options.numSlides || 10,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gamma API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get a presentation by ID
   */
  async getPresentation(id: string): Promise<GammaPresentation> {
    if (!this.apiKey) {
      throw new Error('Gamma API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v1/presentations/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get presentation');
    }

    return response.json();
  }
}

/**
 * Generate a prompt for creating a presentation
 */
export function generatePresentationPrompt(
  topic: string,
  outline?: string[]
): string {
  let prompt = `Create a professional presentation about: ${topic}\n\n`;
  
  if (outline && outline.length > 0) {
    prompt += 'Include the following sections:\n';
    outline.forEach((item, i) => {
      prompt += `${i + 1}. ${item}\n`;
    });
    prompt += '\n';
  }

  prompt += `For each slide, provide:
1. A clear, concise title
2. 3-5 bullet points with key information
3. Speaker notes with additional context

Format the output as JSON with the following structure:
{
  "title": "Presentation Title",
  "slides": [
    {
      "title": "Slide Title",
      "bullets": ["Point 1", "Point 2", "Point 3"],
      "notes": "Speaker notes for this slide"
    }
  ]
}`;

  return prompt;
}

/**
 * Create a Gamma client instance
 */
export function createGammaClient(): GammaClient {
  return new GammaClient();
}

