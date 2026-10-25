import mongoose from 'mongoose';
import env from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`[db] connected to ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  return mongoose.connection;
}

export async function disconnectDatabase() {
  await mongoose.connection.close();
}
