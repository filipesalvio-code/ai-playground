'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn, downloadBlob } from '@/lib/utils';
import { exportToExcel } from '@/lib/export/toExcel';
import { exportToPdf } from '@/lib/export/toPdf';
import { exportToWord } from '@/lib/export/toWord';
import { exportToPpt } from '@/lib/export/toPpt';
import { 
  Download, 
  FileSpreadsheet, 
  FileText,
  Presentation,
  Image,
  ChevronDown,
  Loader2
} from 'lucide-react';

type ExportFormat = 'excel' | 'pdf' | 'word' | 'ppt' | 'image';

interface ExportMenuProps {
  content: string;
  title?: string;
  onExport?: (format: ExportFormat) => void;
  disabled?: boolean;
}

export function ExportMenu({ 
  content, 
  title = 'Export',
  onExport,
  disabled 
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState<ExportFormat | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(format);
    setIsOpen(false);

    try {
      let blob: Blob;
      let filename: string;

      switch (format) {
        case 'excel':
          blob = await exportToExcel({
            headers: ['Content'],
            rows: content.split('\n').map(line => [line]),
          });
          filename = `${title}.xlsx`;
          break;

        case 'pdf':
          blob = await exportToPdf(content, { title });
          filename = `${title}.pdf`;
          break;

        case 'word':
          blob = await exportToWord(content, { title });
          filename = `${title}.docx`;
          break;

        case 'ppt':
          blob = await exportToPpt([{ title, content }], { title });
          filename = `${title}.pptx`;
          break;

        case 'image':
          // For image, we need to use html2canvas on client
          const { exportContentToImage } = await import('@/lib/export/toImage');
          blob = await exportContentToImage(content);
          filename = `${title}.png`;
          break;

        default:
          throw new Error(`Unknown format: ${format}`);
      }

      downloadBlob(blob, filename);
      onExport?.(format);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(null);
    }
  };

  const formats: { id: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { id: 'excel', label: 'Excel (.xlsx)', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'pdf', label: 'PDF (.pdf)', icon: <FileText className="w-4 h-4" /> },
    { id: 'word', label: 'Word (.docx)', icon: <FileText className="w-4 h-4" /> },
    { id: 'ppt', label: 'PowerPoint (.pptx)', icon: <Presentation className="w-4 h-4" /> },
    { id: 'image', label: 'Image (.png)', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled || !!isExporting}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        Export
        <ChevronDown className={cn(
          'w-4 h-4 ml-1 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg shadow-lg z-20 overflow-hidden">
            {formats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                disabled={isExporting === format.id}
                className="flex items-center gap-3 w-full px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--background-tertiary)] transition-colors disabled:opacity-50"
              >
                {isExporting === format.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  format.icon
                )}
                {format.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Simple export button for a specific format
 */
export function ExportButton({
  format,
  content,
  title,
  disabled,
}: {
  format: ExportFormat;
  content: string;
  title?: string;
  disabled?: boolean;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let blob: Blob;
      let filename: string;
      const exportTitle = title || 'export';

      switch (format) {
        case 'excel':
          blob = await exportToExcel({
            headers: ['Content'],
            rows: content.split('\n').map(line => [line]),
          });
          filename = `${exportTitle}.xlsx`;
          break;

        case 'pdf':
          blob = await exportToPdf(content, { title: exportTitle });
          filename = `${exportTitle}.pdf`;
          break;

        case 'word':
          blob = await exportToWord(content, { title: exportTitle });
          filename = `${exportTitle}.docx`;
          break;

        case 'ppt':
          blob = await exportToPpt([{ title: exportTitle, content }], { title: exportTitle });
          filename = `${exportTitle}.pptx`;
          break;

        default:
          throw new Error(`Unknown format: ${format}`);
      }

      downloadBlob(blob, filename);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const icons: Record<ExportFormat, React.ReactNode> = {
    excel: <FileSpreadsheet className="w-4 h-4" />,
    pdf: <FileText className="w-4 h-4" />,
    word: <FileText className="w-4 h-4" />,
    ppt: <Presentation className="w-4 h-4" />,
    image: <Image className="w-4 h-4" />,
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled || isExporting}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icons[format]
      )}
    </Button>
  );
}

