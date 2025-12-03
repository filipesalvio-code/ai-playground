import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI Playground | Multi-Model AI Hub',
  description: 'A unified AI playground combining ChatGPT, Claude, Gemini, Grok, and Perplexity with RAG, DeepSearch, audio transcription, and export capabilities.',
  keywords: ['AI', 'ChatGPT', 'Claude', 'Gemini', 'Grok', 'Perplexity', 'RAG', 'DeepSearch'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
