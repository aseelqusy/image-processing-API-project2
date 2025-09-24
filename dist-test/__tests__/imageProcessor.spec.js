'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const sharp_1 = __importDefault(require('sharp'));
const paths_1 = require('../src/utils/paths');
const imageProcessor_1 = require('../src/utils/imageProcessor');
const TEST_FILE = 'unit-test.jpg';
async function ensureOriginal() {
  if (!fs_1.default.existsSync(paths_1.ORIGINALS))
    fs_1.default.mkdirSync(paths_1.ORIGINALS, { recursive: true });
  if (!fs_1.default.existsSync(paths_1.CACHE))
    fs_1.default.mkdirSync(paths_1.CACHE, { recursive: true });
  const p = path_1.default.join(paths_1.ORIGINALS, TEST_FILE);
  if (!fs_1.default.existsSync(p)) {
    const buf = await (0, sharp_1.default)({
      create: {
        width: 60,
        height: 60,
        channels: 3,
        background: { r: 0, g: 255, b: 0 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();
    fs_1.default.writeFileSync(p, buf);
  }
}
describe('processImage utility', () => {
  beforeAll(async () => {
    await ensureOriginal();
    // نظّف الكاش
    for (const f of fs_1.default.readdirSync(paths_1.CACHE)) {
      fs_1.default.unlinkSync(path_1.default.join(paths_1.CACHE, f));
    }
  });
  it('produces a cached file for valid input', async () => {
    const out = await (0, imageProcessor_1.processImage)({
      filename: TEST_FILE,
      width: 30,
      height: 30,
    });
    expect(fs_1.default.existsSync(out)).toBeTrue();
  });
  it('throws on invalid width', async () => {
    await expectAsync(
      (0, imageProcessor_1.processImage)({
        filename: TEST_FILE,
        width: 0,
        height: 30,
      }),
    ).toBeRejected();
  });
});
