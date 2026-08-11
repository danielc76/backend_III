// Logger centralizado de ShipNow.
// Se utiliza para registrar eventos de la aplicación
// con diferentes niveles de importancia.

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { config } from '../config/env.config.js';

// Niveles personalizados solicitados para el proyecto.
// Cuanto menor es el número, mayor es la prioridad.
const customLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  http: 3,
  info: 4,
  debug: 5
};

// Colores utilizados únicamente para visualizar
// mejor los niveles en la consola.
winston.addColors({
  debug: 'blue',
  http: 'cyan',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'magenta'
});

// Formato utilizado para los logs de consola.
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}] ${message}`;
  })
);

// Formato utilizado para los archivos.
// JSON facilita posteriormente la lectura y procesamiento
// de los registros por otras herramientas.
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Archivo exclusivo para errores.
// DailyRotateFile permite generar archivos separados
// por fecha y limitar su tamaño y antigüedad.
const errorTransport = new DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  maxFiles: '30d',
  maxSize: '20m',
  format: fileFormat
});

// Logger centralizado de toda la aplicación.
export const logger = winston.createLogger({
  levels: customLevels,

  // En desarrollo permite ver también debug.
  // En producción comienza desde info.
  level: config.nodeEnv === 'production' ? 'info' : 'debug',

  transports: [
    // Logs visibles en consola.
    new winston.transports.Console({
      format: consoleFormat
    }),

    // Logs de error persistidos en archivos.
    errorTransport
  ]
});