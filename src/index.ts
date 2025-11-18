import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import { connectDB } from './config/db';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/auth', authRoutes);


  return app;
}

async function start() {
  try {
    await connectDB();

    const app = createApp();

    app.listen(3000, () => {
      console.log(`Server running on port ${3000}`);
    });

  } catch (err) {
    console.log(err);
  }
}

start();
