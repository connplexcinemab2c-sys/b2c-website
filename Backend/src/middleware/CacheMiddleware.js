import { StatusCodes } from 'http-status-codes';
import cache from '../config/NodeCache.config.js';
import ResponseMessage from '../utils/ResponseMessage.js';

const cacheMiddleware = (key) => (req, res, next) => {
    const cacheKeyString = typeof key === 'function' ? key(req) : key;
    const data = cache.get(cacheKeyString);
    if (data) {
        res.setHeader('X-Cache-Status', 'HIT');
        return res.status(200).json({
            status: StatusCodes.OK,
            message: `Data fetched`,
            data: data
          });
    }
    next();
};

export default cacheMiddleware