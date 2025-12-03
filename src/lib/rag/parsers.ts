import type { DocumentMetadata } from '../types';

export interface ParseResult {
  text: string;
  metadata: Partial<DocumentMetadata>;
}

/**
 * Parse PDF files using pdf-parse
 */
export async function parsePDF(buffer: Buffer): Promise<ParseResult> {
  try {
    // Dynamic import to avoid issues with SSR
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParseModule = await import('pdf-parse') as any;
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const data = await pdfParse(buffer);
    
    return {
      text: data.text,
      metadata: {
        pageCount: data.numpages,
        wordCount: data.text.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Parse DOCX files using mammoth
 */
export async function parseDOCX(buffer: Buffer): Promise<ParseResult> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    
    return {
      text: result.value,
      metadata: {
        wordCount: result.value.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Parse plain text files
 */
export async function parseTXT(buffer: Buffer): Promise<ParseResult> {
  const text = buffer.toString('utf-8');
  
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  };
}

/**
 * Parse VTT subtitle files
 * Extracts text content with optional timestamps
 */
export async function parseVTT(buffer: Buffer): Promise<ParseResult> {
  const content = buffer.toString('utf-8');
  const lines = content.split('\n');
  
  const textLines: string[] = [];
  let inCue = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // Skip WEBVTT header and empty lines
    if (trimmed === 'WEBVTT' || trimmed === '') {
      inCue = false;
      continue;
    }
    
    // Skip timestamp lines (format: 00:00:00.000 --> 00:00:00.000)
    if (trimmed.includes('-->')) {
      inCue = true;
      continue;
    }
    
    // Skip cue identifiers (numeric lines before timestamps)
    if (/^\d+$/.test(trimmed)) {
      continue;
    }
    
    // Collect text content
    if (inCue && trimmed) {
      // Remove VTT tags like <v Speaker Name>
      const cleanText = trimmed
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();
      
      if (cleanText) {
        textLines.push(cleanText);
      }
    }
  }
  
  const text = textLines.join(' ');
  
  return {
    text,
    metadata: {
      wordCount: text.split(/\s+/).length,
    },
  };
}

/**
 * Parse PowerPoint files (PPTX)
 * Extracts text from slides
 */
export async function parsePPTX(buffer: Buffer): Promise<ParseResult> {
  try {
    // PPTX files are ZIP archives containing XML files
    // We'll use a simple approach to extract text from the XML
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(buffer);
    
    const textContent: string[] = [];
    
    // Look for slide XML files
    const slideFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
      .sort();
    
    for (const slideFile of slideFiles) {
      const content = await zip.file(slideFile)?.async('string');
      if (content) {
        // Extract text from XML tags
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (textMatches) {
          const slideTexts = textMatches.map(match => 
            match.replace(/<\/?a:t>/g, '')
          );
          textContent.push(slideTexts.join(' '));
        }
      }
    }
    
    // Also check notes
    const notesFiles = Object.keys(zip.files)
      .filter(name => name.match(/ppt\/notesSlides\/notesSlide\d+\.xml/))
      .sort();
    
    for (const notesFile of notesFiles) {
      const content = await zip.file(notesFile)?.async('string');
      if (content) {
        const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
        if (textMatches) {
          const notesTexts = textMatches.map(match => 
            match.replace(/<\/?a:t>/g, '')
          );
          textContent.push(notesTexts.join(' '));
        }
      }
    }
    
    const text = textContent.join('\n\n');
    
    return {
      text,
      metadata: {
        pageCount: slideFiles.length,
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch (error) {
    console.error('PPTX parsing error:', error);
    throw new Error('Failed to parse PPTX file');
  }
}

/**
 * Parse a file based on its extension
 */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<ParseResult> {
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return parsePDF(buffer);
    case 'docx':
      return parseDOCX(buffer);
    case 'txt':
    case 'md':
    case 'markdown':
      return parseTXT(buffer);
    case 'vtt':
    case 'srt':
      return parseVTT(buffer);
    case 'pptx':
      return parsePPTX(buffer);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

/**
 * Get supported file extensions
 */
export function getSupportedExtensions(): string[] {
  return ['pdf', 'docx', 'txt', 'md', 'vtt', 'srt', 'pptx'];
}

/**
 * Check if a file type is supported
 */
export function isSupported(filename: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return getSupportedExtensions().includes(extension || '');
}

