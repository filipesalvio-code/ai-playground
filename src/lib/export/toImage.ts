/**
 * Export HTML element to image using html2canvas
 * Note: This should be called client-side only
 */
export async function exportToImage(
  element: HTMLElement,
  options: {
    format?: 'png' | 'jpeg';
    quality?: number;
    backgroundColor?: string;
    scale?: number;
  } = {}
): Promise<Blob> {
  const {
    format = 'png',
    quality = 0.95,
    backgroundColor = '#0a0f1a',
    scale = 2,
  } = options;

  // Dynamic import html2canvas
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(element, {
    backgroundColor,
    scale,
    logging: false,
    useCORS: true,
    allowTaint: true,
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      },
      `image/${format}`,
      quality
    );
  });
}

/**
 * Export content to image by creating a temporary element
 */
export async function exportContentToImage(
  content: string,
  options: {
    format?: 'png' | 'jpeg';
    width?: number;
    padding?: number;
  } = {}
): Promise<Blob> {
  const { format = 'png', width = 800, padding = 40 } = options;

  // Create temporary container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: ${width}px;
    padding: ${padding}px;
    background: #0a0f1a;
    color: #f9fafb;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
  `;
  container.textContent = content;
  document.body.appendChild(container);

  try {
    const blob = await exportToImage(container, { format });
    return blob;
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Create a simple placeholder image (for server-side or when html2canvas isn't available)
 */
export function createPlaceholderImage(
  width: number = 400,
  height: number = 300,
  text: string = 'Image Export'
): Blob {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  // Background
  ctx.fillStyle = '#0a0f1a';
  ctx.fillRect(0, 0, width, height);

  // Border
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Text
  ctx.fillStyle = '#f9fafb';
  ctx.font = '20px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, width / 2, height / 2);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image'));
        }
      },
      'image/png'
    );
  }) as unknown as Blob;
}

