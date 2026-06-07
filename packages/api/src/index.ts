import dotenv from 'dotenv';
dotenv.config();

import { createApp, prisma, redis } from './app';

const app = createApp();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`[CodeQuiz API] Server running on http://localhost:${PORT}`);
  console.log(`[CodeQuiz API] Swagger docs at http://localhost:${PORT}/api-docs`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
