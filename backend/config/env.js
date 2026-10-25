import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const required = ['MONGODB_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. Copy backend/.env.example to backend/.env and fill it in.`
  );
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB || 25),
  libreOfficePath: process.env.LIBREOFFICE_PATH || '',
  uploadsDir: path.resolve(__dirname, '..', 'uploads'),
  admin: {
    name: process.env.ADMIN_NAME || 'Portal Admin',
    email: process.env.ADMIN_EMAIL || 'admin@examportal.in',
    password: process.env.ADMIN_PASSWORD || 'Admin@12345',
  },
};

export default env;
