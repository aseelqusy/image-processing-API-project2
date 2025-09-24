import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ORIGINALS, CACHE } from '../src/utils/paths';
import { processImage } from '../src/utils/imageProcessor';

const TEST_FILE = 'unit-test.jpg';

async function ensureOriginal(): Promise<void> {
  if (!fs.existsSync(ORIGINALS)) fs.mkdirSync(ORIGINALS, { recursive: true });
  if (!fs.existsSync(CACHE)) fs.mkdirSync(CACHE, { recursive: true });
  const p = path.join(ORIGINALS, TEST_FILE);
  if (!fs.existsSync(p)) {
    const buf = await sharp({
      create: {
        width: 60,
        height: 60,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();
    fs.writeFileSync(p, buf);
  }
}

describe('processImage utility', () => {
  beforeAll(async () => {
    await ensureOriginal();
    // نظّف الكاش
    for (const f of fs.readdirSync(CACHE)) {
      fs.unlinkSync(path.join(CACHE, f));
    }
  });

  it('produces a cached file for valid input', async () => {
    const out = await processImage({
      filename: TEST_FILE,
      width: 30,
      height: 30,
    });
    expect(fs.existsSync(out)).toBeTrue();
  });

  it('throws on invalid width', async () => {
    await expectAsync(
      processImage({
        filename: TEST_FILE,
        width: 0 as unknown as number,
        height: 30,
      }),
    ).toBeRejected();
  });
});
