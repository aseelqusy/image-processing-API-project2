import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { ORIGINALS, CACHE } from '../src/utils/paths';
import { processImage, ProcessingError } from '../src/utils/imageProcessor';

const TEST_FILE = 'unit-test.jpg';

describe('imageProcessor.processImage', () => {
  beforeAll(async () => {
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
        .jpeg({ quality: 92 })
        .toBuffer();
      fs.writeFileSync(p, buf);
    }
  });

  it('creates a resized cached image and returns its path', async () => {
    const out = await processImage({
      filename: TEST_FILE,
      width: 30,
      height: 20,
    });
    expect(fs.existsSync(out)).toBeTrue();
  });

  it('throws on missing file', async () => {
    await expectAsync(
      processImage({ filename: 'x.jpg', width: 10, height: 10 }),
    ).toBeRejectedWith(
      jasmine.objectContaining<ProcessingError>({
        status: 404,
      } as unknown as ProcessingError),
    );
  });

  it('throws on invalid extension', async () => {
    await expectAsync(
      processImage({
        filename: 'x.png' as unknown as string,
        width: 10,
        height: 10,
      }),
    ).toBeRejectedWith(
      jasmine.objectContaining<ProcessingError>({
        status: 400,
      } as unknown as ProcessingError),
    );
  });

  it('throws on invalid dimensions', async () => {
    await expectAsync(
      processImage({ filename: TEST_FILE, width: 0, height: 10 }),
    ).toBeRejected();
    await expectAsync(
      processImage({ filename: TEST_FILE, width: 10, height: -1 }),
    ).toBeRejected();
  });
});
