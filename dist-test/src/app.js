"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const images_1 = __importDefault(require("./routes/images"));
const error_1 = require("./middleware/error");
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: '10mb' }));
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/images', images_1.default);
app.use(error_1.errorHandler);
exports.default = app;
