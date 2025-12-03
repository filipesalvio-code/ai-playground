import { OpenRouterClient } from '../openrouter';
import { DEFAULT_DEEPSEARCH_MODEL, DEFAULT_MODEL } from '../models';
import type { DeepSearchQuery, DeepSearchResult, Citation } from '../types';

interface ResearcherOptions {
  maxSubQuestions?: number;
  synthesisModel?: string;
  searchModel?: string;
}

const DEFAULT_OPTIONS: Required<ResearcherOptions> = {
  maxSubQuestions: 5,
  synthesisModel: DEFAULT_MODEL,
  searchModel: DEFAULT_DEEPSEARCH_MODEL,
};

/**
 * DeepSearch Research Agent
 * Breaks down questions, searches each, and synthesizes results
 */
export class DeepSearchAgent {
  private client: OpenRouterClient;
  private options: Required<ResearcherOptions>;

  constructor(apiKey?: string, options: ResearcherOptions = {}) {
    this.client = new OpenRouterClient(apiKey);
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Run a deep research query
   */
  async research(
    question: string,
    onProgress?: (update: Partial<DeepSearchQuery>) => void
  ): Promise<DeepSearchQuery> {
    const query: DeepSearchQuery = {
      question,
      subQuestions: [],
      searchResults: [],
      status: 'pending',
    };

    try {
      // Step 1: Break down the question
      query.status = 'searching';
      onProgress?.({ status: 'searching' });
      
      const subQuestions = await this.breakdownQuestion(question);
      query.subQuestions = subQuestions;
      onProgress?.({ subQuestions });

      // Step 2: Search each sub-question
      const searchResults: DeepSearchResult[] = [];
      
      for (const subQ of subQuestions) {
        const result = await this.searchSubQuestion(subQ);
        searchResults.push(result);
        query.searchResults = [...searchResults];
        onProgress?.({ searchResults: query.searchResults });
      }

      // Step 3: Synthesize results
      query.status = 'synthesizing';
      onProgress?.({ status: 'synthesizing' });
      
      const { synthesis, citations } = await this.synthesize(question, searchResults);
      query.synthesis = synthesis;
      query.citations = citations;
      
      query.status = 'complete';
      onProgress?.({ synthesis, citations, status: 'complete' });

      return query;
    } catch (error) {
      query.status = 'error';
      onProgress?.({ status: 'error' });
      throw error;
    }
  }

  /**
   * Break down a complex question into sub-questions
   */
  private async breakdownQuestion(question: string): Promise<string[]> {
    const prompt = `You are a research assistant. Break down the following research question into ${this.options.maxSubQuestions} specific sub-questions that would help thoroughly answer the main question.

Main Question: ${question}

Return ONLY the sub-questions as a numbered list (1. 2. 3. etc.), nothing else.`;

    const response = await this.client.chat(this.options.synthesisModel, [
      { id: '1', role: 'user', content: prompt, timestamp: Date.now() },
    ]);

    const content = response.choices[0]?.message?.content || '';
    
    // Parse numbered list
    const lines = content.split('\n').filter(line => line.trim());
    const questions = lines
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0)
      .slice(0, this.options.maxSubQuestions);

    return questions.length > 0 ? questions : [question];
  }

  /**
   * Search for answers to a sub-question using Perplexity
   */
  private async searchSubQuestion(question: string): Promise<DeepSearchResult> {
    const response = await this.client.chat(this.options.searchModel, [
      { id: '1', role: 'user', content: question, timestamp: Date.now() },
    ]);

    const answer = response.choices[0]?.message?.content || '';
    
    // Extract citations from Perplexity response (they include sources)
    const sources = this.extractCitations(answer);

    return {
      question,
      answer,
      sources,
    };
  }

  /**
   * Extract citations from text
   */
  private extractCitations(text: string): Citation[] {
    const citations: Citation[] = [];
    
    // Look for URLs in the text
    const urlRegex = /https?:\/\/[^\s\]]+/g;
    const urls = text.match(urlRegex) || [];
    
    urls.forEach((url, index) => {
      // Clean URL (remove trailing punctuation)
      const cleanUrl = url.replace(/[.,;:!?)]+$/, '');
      
      citations.push({
        id: `citation-${index}`,
        title: `Source ${index + 1}`,
        url: cleanUrl,
      });
    });

    return citations;
  }

  /**
   * Synthesize all search results into a comprehensive answer
   */
  private async synthesize(
    question: string,
    results: DeepSearchResult[]
  ): Promise<{ synthesis: string; citations: Citation[] }> {
    const context = results
      .map((r, i) => `## Sub-question ${i + 1}: ${r.question}\n\n${r.answer}`)
      .join('\n\n---\n\n');

    const prompt = `You are a research assistant. Based on the following research findings, provide a comprehensive, well-structured answer to the main question. Include relevant details from all sources and cite them where appropriate.

# Main Question
${question}

# Research Findings
${context}

# Instructions
1. Provide a comprehensive answer that addresses all aspects of the question
2. Use clear headings and structure
3. Include specific facts and data from the research
4. Be objective and balanced
5. End with a brief summary

Please provide your synthesized answer:`;

    const response = await this.client.chat(this.options.synthesisModel, [
      { id: '1', role: 'user', content: prompt, timestamp: Date.now() },
    ]);

    const synthesis = response.choices[0]?.message?.content || '';
    
    // Collect all citations from results
    const allCitations: Citation[] = [];
    results.forEach(result => {
      allCitations.push(...result.sources);
    });
    
    // Deduplicate by URL
    const uniqueCitations = allCitations.filter(
      (citation, index, self) => 
        index === self.findIndex(c => c.url === citation.url)
    );

    return {
      synthesis,
      citations: uniqueCitations,
    };
  }
}

/**
 * Create a research agent instance
 */
export function createResearcher(options?: ResearcherOptions): DeepSearchAgent {
  return new DeepSearchAgent(process.env.OPENROUTER_API_KEY, options);
}

