// Logger centralizado de ShipNow.
// Se utiliza para registrar eventos de la aplicación
// con diferentes niveles de importancia.

import winston from 'winston';

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
const errorTransport = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error',
  maxsize: 20 * 1024 * 1024,
  maxFiles: 5,
  format: fileFormat
});

// Archivo general con la actividad correspondiente al nivel configurado.
const combinedTransport = new winston.transports.File({
  filename: 'logs/combined.log',
  level: config.logLevel,
  maxsize: 20 * 1024 * 1024,
  maxFiles: 5,
  format: fileFormat
});

const transports = [
  errorTransport,
  combinedTransport
];

// En desarrollo también mostramos los registros en la consola.
if (config.nodeEnv === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// Logger centralizado de toda la aplicación.
export const logger = winston.createLogger({
  levels: customLevels,

  // El nivel se puede adaptar a cada entorno sin modificar el código.
  level: config.logLevel,
  transports
});
