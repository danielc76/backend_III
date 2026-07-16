import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'NODE_ENV'
];

requiredEnvVars.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Falta configurar la variable de entorno: ${variable}`);
  }
});


export const config = {
  port: process.env.PORT,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV
};