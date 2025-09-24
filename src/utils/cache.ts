import fs from 'fs';
import path from 'path';
import { CACHE } from './paths';

export function clearAllCache(): void {
  if (!fs.existsSync(CACHE)) return;
  for (const f of fs.readdirSync(CACHE)) {
    const p = path.join(CACHE, f);
    try {
      fs.unlinkSync(p);
    } catch {}
  }
}
