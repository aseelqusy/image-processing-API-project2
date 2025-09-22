import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { CACHE, ORIGINALS } from './paths';
import { sha1 } from './hash';

export type OutputFormat = 'jpeg';

export interface ResizeParams {
  filename: string; // يجب .jpg/.jpeg
  width: number;
  height: number;
  quality?: number; // 1..100
  format?: OutputFormat;
}

export class ProcessingError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function processImage({
  filename,
  width,
  height,
  quality = 80,
  format = 'jpeg',
}: ResizeParams): Promise<string> {
  if (!filename) throw new ProcessingError('filename is required', 400);
  if (!/\.(jpe?g)$/i.test(filename))
    throw new ProcessingError('only .jpg/.jpeg is supported', 400);
  if (!Number.isFinite(width) || !Number.isFinite(height))
    throw new ProcessingError('width and height must be numbers', 400);
  if (width <= 0 || height <= 0)
    throw new ProcessingError(
      'width and height must be greater than zero',
      400,
    );

  const origPath = path.join(ORIGINALS, filename);
  if (!fs.existsSync(origPath))
    throw new ProcessingError('source image not found', 404);

  const key = sha1(
    JSON.stringify({ filename, width, height, quality, format }),
  );
  const outPath = path.join(CACHE, `${key}.jpg`);

  
  if (fs.existsSync(outPath)) return outPath;

  await sharp(origPath)
    .rotate()
    .resize(width, height, { fit: 'cover' })
    .jpeg({ quality })
    .toFile(outPath);

  return outPath;
}
