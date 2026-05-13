import dotenv from 'dotenv';

dotenv.config();

export const config = {
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  demoUser: {
    id: 'user-1',
    username: process.env.AUTH_DEMO_USER ?? 'admin',
    password: process.env.AUTH_DEMO_PASSWORD ?? 'password123',
    role: process.env.AUTH_DEMO_ROLE ?? 'admin'
  }
};
