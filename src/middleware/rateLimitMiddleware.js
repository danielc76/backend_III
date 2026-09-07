import { RATE_LIMIT } from '../constants/index.js';
import { ERROR_CODES } from '../constants/error.constants.js';
import { customError } from '../utils/customError.js';


const scheduleCleanup = (hits, ip, hit, windowMs) => {

  const timeout = setTimeout(() => {

    if (hits.get(ip) === hit) {
      hits.delete(ip);
    }

  }, windowMs);

  // El temporizador no debe mantener el proceso activo al finalizar la aplicación.
  timeout.unref?.();

};


export const createRateLimitMiddleware = ({
  limit = RATE_LIMIT.MAX_REQUESTS,
  windowMs = RATE_LIMIT.WINDOW_MS
} = {}) => {

  const hits = new Map();

  return (req, res, next) => {

    const ip = req.ip;
    const now = Date.now();
    let hit = hits.get(ip);

    if (!hit || now - hit.first >= windowMs) {
      hit = { count: 0, first: now };
      hits.set(ip, hit);
      scheduleCleanup(hits, ip, hit, windowMs);
    }

    hit.count += 1;

    if (hit.count > limit) {
      const retryAfter = Math.max(
        1,
        Math.ceil((hit.first + windowMs - now) / 1000)
      );

      res.set('Retry-After', String(retryAfter));

      return next(new customError(ERROR_CODES.RATE_LIMIT_EXCEEDED, {
        // Se registra el primer bloqueo, pero no cada intento repetido.
        skipLog: hit.count > limit + 1
      }));
    }

    next();

  };

};


export const rateLimitMiddleware = createRateLimitMiddleware();
