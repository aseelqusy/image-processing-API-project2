'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const supertest_1 = __importDefault(require('supertest'));
const fs_1 = __importDefault(require('fs'));
const path_1 = __importDefault(require('path'));
const sharp_1 = __importDefault(require('sharp'));
const app_1 = __importDefault(require('../src/app'));
const paths_1 = require('../src/utils/paths');
// توليد صورة اختبار داخل originals
const TEST_FILE = 'spec-test.jpg';
async function ensureOriginal() {
  if (!fs_1.default.existsSync(paths_1.ORIGINALS))
    fs_1.default.mkdirSync(paths_1.ORIGINALS, { recursive: true });
  if (!fs_1.default.existsSync(paths_1.CACHE))
    fs_1.default.mkdirSync(paths_1.CACHE, { recursive: true });
  const p = path_1.default.join(paths_1.ORIGINALS, TEST_FILE);
  if (!fs_1.default.existsSync(p)) {
    const buf = await (0, sharp_1.default)({
      create: {
        width: 200,
        height: 200,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .jpeg({ quality: 85 })
      .toBuffer();
    fs_1.default.writeFileSync(p, buf);
  }
}
describe('GET /api/images endpoint', () => {
  beforeAll(async () => {
    await ensureOriginal();
    // نظّف الكاش قبل كل سويت
    for (const f of fs_1.default.readdirSync(paths_1.CACHE)) {
      fs_1.default.unlinkSync(path_1.default.join(paths_1.CACHE, f));
    }
  });
  it('returns 200 and a jpeg for valid query', async () => {
    const res = await (0, supertest_1.default)(app_1.default)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 120, height: 90 });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/image\/jpeg/);
  });
  it('returns 400 for missing width/height', async () => {
    const res = await (0, supertest_1.default)(app_1.default)
      .get('/api/images')
      .query({ filename: TEST_FILE, width: 120 }); // height ناقص
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
  it('returns 404 for non-existent file', async () => {
    const res = await (0, supertest_1.default)(app_1.default)
      .get('/api/images')
      .query({ filename: 'nope.jpg', width: 100, height: 100 });
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });
});
