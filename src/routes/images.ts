import { Router } from 'express';
import path from 'path';
import { processImage, ProcessingError } from '../utils/imageProcessor';
import fs from 'fs';
import { ORIGINALS } from '../utils/paths';
import { clearAllCache } from '../utils/cache';

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

router.post('/', async (req, res, next) => {
  try {
    if (!req.is('application/json'))
      throw new ProcessingError('content-type must be application/json', 400);
    const { filename, data } = req.body as { filename?: string; data?: string };

    if (!filename) throw new ProcessingError('filename is required', 400);
    if (!/\.(jpe?g)$/i.test(filename))
      throw new ProcessingError('only .jpg/.jpeg is supported', 400);
    if (!data) throw new ProcessingError('data (base64) is required', 400);

    const outPath = `${ORIGINALS}/${filename}`;
    if (fs.existsSync(outPath))
      throw new ProcessingError('file already exists', 409);

    // نقبل بصيغة data URI أو base64 خام
    const b64 = String(data).replace(/^data:image\/jpeg;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    if (buf.length === 0) throw new ProcessingError('invalid base64 data', 400);

    fs.writeFileSync(outPath, buf);
    res.status(201).json({ ok: true, filename });
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    if (!req.is('application/json')) {
      throw new ProcessingError('content-type must be application/json', 400);
    }
    const { filename, data } = req.body as { filename?: string; data?: string };

    if (!filename) throw new ProcessingError('filename is required', 400);
    if (!/\.(jpe?g)$/i.test(filename)) {
      throw new ProcessingError('only .jpg/.jpeg is supported', 400);
    }
    if (!data) throw new ProcessingError('data (base64) is required', 400);

    const outPath = path.join(ORIGINALS, filename);
    if (!fs.existsSync(outPath)) {
      throw new ProcessingError('source image not found', 404);
    }

    const b64 = String(data).replace(/^data:image\/jpeg;base64,/, '');
    const buf = Buffer.from(b64, 'base64');
    if (buf.length === 0) throw new ProcessingError('invalid base64 data', 400);

    const tmpPath = `${outPath}.tmp-${Date.now()}`;
    try {
      fs.writeFileSync(tmpPath, buf);

      try {
        fs.unlinkSync(outPath);
      } catch (e: unknown) {
        const err = e as NodeJS.ErrnoException;
        if (err?.code !== 'ENOENT') {
          throw err;
        }
      }

      fs.renameSync(tmpPath, outPath);
    } catch (e: unknown) {
      try {
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      } catch {}
      const err = e as NodeJS.ErrnoException;
      throw new ProcessingError(
        `failed to replace file (${err?.code ?? err?.message ?? 'unknown'})`,
        500,
      );
    }

    clearAllCache();
    res.json({ ok: true, filename, updated: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:filename', async (req, res, next) => {
  try {
    const filename = String(req.params.filename || '');

    if (!filename) throw new ProcessingError('filename is required', 400);
    if (!/\.(jpe?g)$/i.test(filename))
      throw new ProcessingError('only .jpg/.jpeg is supported', 400);

    const p = path.join(ORIGINALS, filename);
    if (!fs.existsSync(p))
      throw new ProcessingError('source image not found', 404);

    fs.unlinkSync(p);
    clearAllCache();

    res.json({ ok: true, filename, deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
