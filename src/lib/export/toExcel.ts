import ExcelJS from 'exceljs';
import type { SpreadsheetData } from '../types';

interface ExcelExportOptions {
  sheetName?: string;
  includeHeaders?: boolean;
  headerStyle?: {
    bold?: boolean;
    fill?: string;
  };
}

/**
 * Export data to Excel format
 */
export async function exportToExcel(
  data: SpreadsheetData,
  options: ExcelExportOptions = {}
): Promise<Blob> {
  const {
    sheetName = 'Sheet1',
    includeHeaders = true,
    headerStyle = { bold: true, fill: '#1f2937' },
  } = options;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AI Playground';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);

  // Add headers
  if (includeHeaders && data.headers.length > 0) {
    const headerRow = worksheet.addRow(data.headers);
    
    headerRow.eachCell((cell) => {
      cell.font = { bold: headerStyle.bold };
      if (headerStyle.fill) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: headerStyle.fill.replace('#', '') },
        };
        cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' } };
      }
      cell.border = {
        bottom: { style: 'thin' },
      };
    });
  }

  // Add data rows
  for (const row of data.rows) {
    worksheet.addRow(row);
  }

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Export conversation to Excel
 */
export async function exportConversationToExcel(
  messages: { role: string; content: string; timestamp: number }[]
): Promise<Blob> {
  const data: SpreadsheetData = {
    headers: ['Role', 'Message', 'Time'],
    rows: messages.map((msg) => [
      msg.role,
      msg.content,
      new Date(msg.timestamp).toLocaleString(),
    ]),
  };

  return exportToExcel(data, { sheetName: 'Conversation' });
}

/**
 * Export research to Excel
 */
export async function exportResearchToExcel(
  question: string,
  synthesis: string,
  citations: { title: string; url: string }[]
): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  
  // Main sheet
  const mainSheet = workbook.addWorksheet('Research');
  mainSheet.addRow(['Question', question]);
  mainSheet.addRow([]);
  mainSheet.addRow(['Synthesis']);
  mainSheet.addRow([synthesis]);
  
  // Sources sheet
  if (citations.length > 0) {
    const sourcesSheet = workbook.addWorksheet('Sources');
    sourcesSheet.addRow(['#', 'Title', 'URL']);
    citations.forEach((cite, i) => {
      sourcesSheet.addRow([i + 1, cite.title, cite.url]);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

