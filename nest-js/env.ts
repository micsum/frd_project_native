import { config } from 'dotenv';
import populateEnv from 'populate-env';

config();

export const env = {
  NODE_ENV: 'development',
  DB_HOST: 'localhost',
  DB_PORT: 5432,
  DB_NAME: '',
  DB_USERNAME: '',
  DB_PASSWORD: '',
  JWT_SECRET: '',
  API_KEY: '',
  OPENAI_API_KEY: '',
};

populateEnv(env, { mode: 'halt' });
