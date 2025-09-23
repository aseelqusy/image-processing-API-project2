import express from 'express';
import images from './routes/images';
import { errorHandler } from './middleware/error';

const app = express();

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/images', images);
app.use(errorHandler);

export default app;
