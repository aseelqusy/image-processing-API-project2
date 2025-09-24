"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const imageProcessor_1 = require("../utils/imageProcessor");
const fs_1 = __importDefault(require("fs"));
const paths_1 = require("../utils/paths");
const cache_1 = require("../utils/cache");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const filename = String(req.query.filename || '');
        const width = Number(req.query.width);
        const height = Number(req.query.height);
        if (!filename)
            throw new imageProcessor_1.ProcessingError('filename is required', 400);
        if (Number.isNaN(width) || Number.isNaN(height))
            throw new imageProcessor_1.ProcessingError('width and height are required', 400);
        const outPath = await (0, imageProcessor_1.processImage)({ filename, width, height });
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.setHeader('Content-Type', 'image/jpeg');
        res.sendFile(path_1.default.resolve(outPath));
    }
    catch (err) {
        next(err);
    }
});
router.post('/', async (req, res, next) => {
    try {
        if (!req.is('application/json'))
            throw new imageProcessor_1.ProcessingError('content-type must be application/json', 400);
        const { filename, data } = req.body;
        if (!filename)
            throw new imageProcessor_1.ProcessingError('filename is required', 400);
        if (!/\.(jpe?g)$/i.test(filename))
            throw new imageProcessor_1.ProcessingError('only .jpg/.jpeg is supported', 400);
        if (!data)
            throw new imageProcessor_1.ProcessingError('data (base64) is required', 400);
        const outPath = `${paths_1.ORIGINALS}/${filename}`;
        if (fs_1.default.existsSync(outPath))
            throw new imageProcessor_1.ProcessingError('file already exists', 409);
        // نقبل بصيغة data URI أو base64 خام
        const b64 = String(data).replace(/^data:image\/jpeg;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        if (buf.length === 0)
            throw new imageProcessor_1.ProcessingError('invalid base64 data', 400);
        fs_1.default.writeFileSync(outPath, buf);
        res.status(201).json({ ok: true, filename });
    }
    catch (err) {
        next(err);
    }
});
router.put('/', async (req, res, next) => {
    try {
        if (!req.is('application/json')) {
            throw new imageProcessor_1.ProcessingError('content-type must be application/json', 400);
        }
        const { filename, data } = req.body;
        if (!filename)
            throw new imageProcessor_1.ProcessingError('filename is required', 400);
        if (!/\.(jpe?g)$/i.test(filename)) {
            throw new imageProcessor_1.ProcessingError('only .jpg/.jpeg is supported', 400);
        }
        if (!data)
            throw new imageProcessor_1.ProcessingError('data (base64) is required', 400);
        const outPath = path_1.default.join(paths_1.ORIGINALS, filename);
        if (!fs_1.default.existsSync(outPath)) {
            throw new imageProcessor_1.ProcessingError('source image not found', 404);
        }
        const b64 = String(data).replace(/^data:image\/jpeg;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        if (buf.length === 0)
            throw new imageProcessor_1.ProcessingError('invalid base64 data', 400);
        const tmpPath = `${outPath}.tmp-${Date.now()}`;
        try {
            fs_1.default.writeFileSync(tmpPath, buf);
            try {
                fs_1.default.unlinkSync(outPath);
            }
            catch (e) {
                const err = e;
                if (err?.code !== 'ENOENT') {
                    throw err;
                }
            }
            fs_1.default.renameSync(tmpPath, outPath);
        }
        catch (e) {
            try {
                if (fs_1.default.existsSync(tmpPath))
                    fs_1.default.unlinkSync(tmpPath);
            }
            catch { }
            const err = e;
            throw new imageProcessor_1.ProcessingError(`failed to replace file (${err?.code ?? err?.message ?? 'unknown'})`, 500);
        }
        (0, cache_1.clearAllCache)();
        res.json({ ok: true, filename, updated: true });
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:filename', async (req, res, next) => {
    try {
        const filename = String(req.params.filename || '');
        if (!filename)
            throw new imageProcessor_1.ProcessingError('filename is required', 400);
        if (!/\.(jpe?g)$/i.test(filename))
            throw new imageProcessor_1.ProcessingError('only .jpg/.jpeg is supported', 400);
        const p = path_1.default.join(paths_1.ORIGINALS, filename);
        if (!fs_1.default.existsSync(p))
            throw new imageProcessor_1.ProcessingError('source image not found', 404);
        fs_1.default.unlinkSync(p);
        (0, cache_1.clearAllCache)();
        res.json({ ok: true, filename, deleted: true });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
