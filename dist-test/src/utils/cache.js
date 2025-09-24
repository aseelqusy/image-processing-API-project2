"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllCache = clearAllCache;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const paths_1 = require("./paths");
function clearAllCache() {
    if (!fs_1.default.existsSync(paths_1.CACHE))
        return;
    for (const f of fs_1.default.readdirSync(paths_1.CACHE)) {
        const p = path_1.default.join(paths_1.CACHE, f);
        try {
            fs_1.default.unlinkSync(p);
        }
        catch { }
    }
}
