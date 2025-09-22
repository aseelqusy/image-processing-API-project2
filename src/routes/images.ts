import { Router } from 'express';
import path from 'path';
import { processImage, ProcessingError } from '../utils/imageProcessor';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const filename = String(req.query.filename || '');
    const width = Number(req.query.width);
    const height = Number(req.query.height);

    if (!filename) throw new ProcessingError('filename is required', 400);
    if (Number.isNaN(width) || Number.isNaN(height))
      throw new ProcessingError('width and height are required', 400);

    const outPath = await processImage({ filename, width, height });

    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(path.resolve(outPath));
  } catch (err) {
    next(err);
  }
});

export default router;
