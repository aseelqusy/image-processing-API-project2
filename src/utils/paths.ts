import path from 'path';
export const ROOT = process.cwd();
export const STORAGE = path.join(ROOT, 'storage');
export const ORIGINALS = path.join(STORAGE, 'originals');
export const CACHE = path.join(STORAGE, 'cache');
