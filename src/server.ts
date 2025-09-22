import 'dotenv/config';
import fs from 'fs';
import app from './app';

const PORT = Number(process.env.PORT || 3000);


for (const p of ['storage/originals', 'storage/cache']) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
