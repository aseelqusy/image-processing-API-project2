"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    const anyErr = err;
    const status = anyErr?.status ?? 500;
    const message = anyErr?.message ?? 'Internal Server Error';
    if (status >= 500)
        console.error(err);
    res.status(status).json({ error: message });
}
