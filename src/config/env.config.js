import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'PORT',
  'MONGODB_URI',
  'NODE_ENV'
];

const validEnvironments = [
  'development',
  'test',
  'production'
];

const validLogLevels = [
  'fatal',
  'error',
  'warn',
  'http',
  'info',
  'debug'
];

requiredEnvVars.forEach((variable) => {
  if (!process.env[variable]) {
    throw new Error(`Falta configurar la variable de entorno: ${variable}`);
  }
});

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('La variable PORT debe ser un número entre 1 y 65535');
}

if (!validEnvironments.includes(process.env.NODE_ENV)) {
  throw new Error(
    'La variable NODE_ENV debe ser development, test o production'
  );
}

const defaultLogLevel = process.env.NODE_ENV === 'production'
  ? 'info'
  : 'debug';

const logLevel = process.env.LOG_LEVEL || defaultLogLevel;

if (!validLogLevels.includes(logLevel)) {
  throw new Error(
    'La variable LOG_LEVEL no contiene un nivel de log válido'
  );
}

export const config = {
  port,
  mongoUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
  logLevel
};
