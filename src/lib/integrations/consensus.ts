/**
 * Consensus Integration
 * https://consensus.app - AI-powered academic paper search
 */

interface ConsensusConfig {
  apiKey?: string;
}

interface SearchOptions {
  query: string;
  limit?: number;
  yearFrom?: number;
  yearTo?: number;
  openAccess?: boolean;
}

export interface PaperResult {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  year: number;
  journal?: string;
  doi?: string;
  url: string;
  citationCount?: number;
  consensus?: {
    summary: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

interface SearchResponse {
  papers: PaperResult[];
  totalResults: number;
  query: string;
}

/**
 * Consensus API client for academic paper search
 */
export class ConsensusClient {
  private apiKey: string | null;
  private baseUrl = 'https://api.consensus.app';

  constructor(config: ConsensusConfig = {}) {
    this.apiKey = config.apiKey || process.env.CONSENSUS_API_KEY || null;
  }

  /**
   * Check if Consensus integration is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Search for academic papers
   */
  async search(options: SearchOptions): Promise<SearchResponse> {
    if (!this.apiKey) {
      throw new Error('Consensus API key not configured');
    }

    const params = new URLSearchParams({
      q: options.query,
      limit: (options.limit || 10).toString(),
    });

    if (options.yearFrom) params.set('year_from', options.yearFrom.toString());
    if (options.yearTo) params.set('year_to', options.yearTo.toString());
    if (options.openAccess) params.set('open_access', 'true');

    const response = await fetch(`${this.baseUrl}/v1/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Consensus API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get paper details by ID
   */
  async getPaper(id: string): Promise<PaperResult> {
    if (!this.apiKey) {
      throw new Error('Consensus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v1/papers/${id}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get paper');
    }

    return response.json();
  }

  /**
   * Get a consensus summary for a topic
   */
  async getConsensus(topic: string): Promise<{
    topic: string;
    summary: string;
    papers: PaperResult[];
    confidence: 'high' | 'medium' | 'low';
  }> {
    if (!this.apiKey) {
      throw new Error('Consensus API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/v1/consensus`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Consensus API error: ${response.status} - ${error}`);
    }

    return response.json();
  }
}

/**
 * Format paper citation in APA style
 */
export function formatAPACitation(paper: PaperResult): string {
  const authors = paper.authors.length > 1 
    ? `${paper.authors[0]} et al.` 
    : paper.authors[0] || 'Unknown';
  
  let citation = `${authors} (${paper.year}). ${paper.title}`;
  
  if (paper.journal) {
    citation += `. ${paper.journal}`;
  }
  
  if (paper.doi) {
    citation += `. https://doi.org/${paper.doi}`;
  }
  
  return citation;
}

/**
 * Generate a research prompt using Consensus results
 */
export function generateResearchPrompt(
  question: string,
  papers: PaperResult[]
): string {
  let prompt = `Based on the following academic research, answer this question: ${question}\n\n`;
  prompt += 'Relevant research papers:\n\n';
  
  papers.forEach((paper, i) => {
    prompt += `[${i + 1}] ${paper.title}\n`;
    prompt += `Authors: ${paper.authors.join(', ')}\n`;
    prompt += `Abstract: ${paper.abstract}\n\n`;
  });
  
  prompt += `Please provide a comprehensive answer based on these research findings. 
Cite the papers using their numbers [1], [2], etc. when referencing specific findings.`;
  
  return prompt;
}

/**
 * Create a Consensus client instance
 */
export function createConsensusClient(): ConsensusClient {
  return new ConsensusClient();
}

