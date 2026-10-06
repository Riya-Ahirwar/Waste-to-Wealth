/**
 * Client-side image processing utilities.
 * Compresses camera and gallery images before sending them to the AI API.
 */

export interface ProcessedImage {
  dataUrl: string;
  base64Data: string;
  mimeType: string;
  width: number;
  height: number;
  sizeKb: number;
}

/**
 * Resizes and compresses an image File or Blob to target dimensions and quality.
 * Prevents oversized base64 payloads when calling Gemini/Claude vision APIs.
 */
export async function compressImage(
  file: File | Blob,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.82
): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2D canvas context'));
          return;
        }

        // Draw image with smooth bicubic interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        const base64Data = dataUrl.split(',')[1];
        const sizeKb = Math.round((base64Data.length * (3 / 4)) / 1024);

        resolve({
          dataUrl,
          base64Data,
          mimeType,
          width,
          height,
          sizeKb,
        });
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
