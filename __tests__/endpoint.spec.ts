import request from 'supertest';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import app from '../src/app';
import { ORIGINALS, CACHE } from '../src/utils/paths';

const TEST_FILE = 'spec-test.jpg';
const TEST_W = 120;
const TEST_H = 80;

describe('GET /api/images endpoint', () => {
  beforeAll(async () => {
    if (!fs.existsSync(ORIGINALS)) fs.mkdirSync(ORIGINALS, { recursive: true });
    if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });

    const imgPath = path.join(ORIGINALS, TEST_FILE);
    if (!fs.existsSync(imgPath)) {
      const buf = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg({ quality: 90 })
        .toBuffer();
      fs.writeFileSync(imgPath, buf);
    }
  });

  it('returns 200 and image/jpeg for valid query', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: TEST_W, height: TEST_H });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
  });

  it('400 when filename missing', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ width: 100, height: 100 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('400 when width/height missing', async () => {
    const r1 = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 100 });
    const r2 = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, height: 100 });
    expect(r1.status).toBe(400);
    expect(r2.status).toBe(400);
  });

  it('400 when width/height invalid (<=0)', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 0, height: -5 });
    expect(res.status).toBe(400);
  });

  it('404 when file does not exist', async () => {
    const res = await request(app)
      .get('/api/images')
      .query({ filename: 'missing.jpg', width: 100, height: 100 });
    expect(res.status).toBe(404);
  });
});
