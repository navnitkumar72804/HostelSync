import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { APP_PORT } from './config/env.js';
import { ensureDatabaseConnectedWithRetry } from './config/db.js';
import { seedDatabase } from './config/db.js';
import fs from 'fs';
import path from 'path';

const port = APP_PORT;

// ensure uploads directory exists (prevents multer ENOENT errors)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

async function start() {
  const server = createServer(app);

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use. Please free the port or set PORT to a different value.`);
      console.error(`To free the port, run: netstat -ano | findstr :${port}`);
      process.exit(1);
    }
    console.error('Server error:', err);
    process.exit(1);
  });

  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  // After the server is up, ensure DB connection and seed
  try {
    await ensureDatabaseConnectedWithRetry(3);
    await seedDatabase();
    console.log('Database seeded successfully');
  } catch (e) {
    console.error('Database initialization failed:', e?.message || e);
  }
}

// Error handler is already set up in app.js

start().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});


