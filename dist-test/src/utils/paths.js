'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.CACHE = exports.ORIGINALS = exports.STORAGE = exports.ROOT = void 0;
const path_1 = __importDefault(require('path'));
exports.ROOT = process.cwd();
exports.STORAGE = path_1.default.join(exports.ROOT, 'storage');
exports.ORIGINALS = path_1.default.join(exports.STORAGE, 'originals');
exports.CACHE = path_1.default.join(exports.STORAGE, 'cache');
