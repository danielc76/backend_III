import { LIST_LIMITS } from '../constants/index.js';


export const getListOptions = (query = {}, allowedFilters = []) => {

  const requestedLimit = Number(query.limit);

  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, LIST_LIMITS.MAX)
    : LIST_LIMITS.DEFAULT;

  const filters = {};

  allowedFilters.forEach((field) => {

    if (typeof query[field] === 'string' && query[field].trim()) {
      filters[field] = query[field].trim();
    }

  });

  return {
    filters,
    limit
  };

};
