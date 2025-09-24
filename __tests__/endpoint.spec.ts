import request from 'supertest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import app from '../src/app';
import { ORIGINALS, CACHE } from '../src/utils/paths';


const TEST_FILE = 'spec-test.jpg';
async function ensureOriginal(): Promise<void> {
  if (!fs.existsSync(ORIGINALS)) fs.mkdirSync(ORIGINALS, { recursive: true });
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
  const p = path.join(ORIGINALS, TEST_FILE);
  if (!fs.existsSync(p)) {
    const buf = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg({ quality: 85 })
      .toBuffer();
    fs.writeFileSync(p, buf);
  }
}

describe('GET /api/images endpoint', () => {
  beforeAll(async () => {
    await ensureOriginal();
   
    for (const f of fs.readdirSync(CACHE)) {
      fs.unlinkSync(path.join(CACHE, f));
    }
  });

  it('returns 200 and a jpeg for valid query', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 120, height: 90 });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
  });

  it('returns 400 for missing width/height', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 120 }); 
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 for non-existent file', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: 'nope.jpg', width: 100, height: 100 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
