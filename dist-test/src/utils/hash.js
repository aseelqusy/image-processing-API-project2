"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha1 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const sha1 = (s) => crypto_1.default.createHash('sha1').update(s).digest('hex');
exports.sha1 = sha1;
