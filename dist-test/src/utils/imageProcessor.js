"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcessingError = void 0;
exports.processImage = processImage;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const paths_1 = require("./paths");
const hash_1 = require("./hash");
class ProcessingError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}
exports.ProcessingError = ProcessingError;
async function processImage({ filename, width, height, quality = 80, format = 'jpeg', }) {
    if (!filename)
        throw new ProcessingError('filename is required', 400);
    if (!/\.(jpe?g)$/i.test(filename))
        throw new ProcessingError('only .jpg/.jpeg is supported', 400);
    if (!Number.isFinite(width) || !Number.isFinite(height))
        throw new ProcessingError('width and height must be numbers', 400);
    if (width <= 0 || height <= 0)
        throw new ProcessingError('width and height must be greater than zero', 400);
    const origPath = path_1.default.join(paths_1.ORIGINALS, filename);
    if (!fs_1.default.existsSync(origPath))
        throw new ProcessingError('source image not found', 404);
    const key = (0, hash_1.sha1)(JSON.stringify({ filename, width, height, quality, format }));
    const outPath = path_1.default.join(paths_1.CACHE, `${key}.jpg`);
    if (fs_1.default.existsSync(outPath))
        return outPath;
    await (0, sharp_1.default)(origPath)
        .rotate()
        .resize(width, height, { fit: 'cover' })
        .jpeg({ quality })
        .toFile(outPath);
    return outPath;
}
