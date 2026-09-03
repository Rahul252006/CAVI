import app from './app.js';
import { config } from './config/index.js';
import { getMongoClient } from './integrations/mongodb/client.js';

const PORT = config.port;

async function bootstrap() {
  try {
    // Attempt MongoDB connection eagerly
    await getMongoClient();
    console.log('[CAVI Backend] Database connected');
  } catch (err) {
    console.warn('[CAVI Backend] Starting server with deferred database connection');
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 CAVI Backend running on http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`🔒 Allowed CORS: ${config.corsOrigin}`);
    console.log(`====================================================`);
  });
}

bootstrap().catch((err) => {
  console.error('[CAVI Backend] Fatal error during bootstrap:', err);
  process.exit(1);
});
