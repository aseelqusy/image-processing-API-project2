'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
require('dotenv/config');
const fs_1 = __importDefault(require('fs'));
const app_1 = __importDefault(require('./app'));
const PORT = Number(process.env.PORT || 3000);
for (const p of ['storage/originals', 'storage/cache']) {
  if (!fs_1.default.existsSync(p))
    fs_1.default.mkdirSync(p, { recursive: true });
}
app_1.default.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
