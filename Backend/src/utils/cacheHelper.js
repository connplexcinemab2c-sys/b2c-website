import cache from "../config/NodeCache.config.js";

const cacheHelper = {
    setCache: (key, value, ttl) => {
        if (ttl) {
            cache.set(key, value, ttl);
        } else {
            cache.set(key, value);
        }
    },
    deleteCache: (key) => {
        cache.del(key)
    },
    deleteManyCache : (keys) =>{
        keys.forEach((key) => cache.del(key));
    },
    getKeysByPrefix: (prefix) => {
        const allKeys = cache.keys();
        return allKeys.filter(key => key.startsWith(prefix));
    },
    deleteKeysByPrefix: (prefix) => {
        const keysToDelete = cacheHelper.getKeysByPrefix(prefix);
        keysToDelete.forEach((key) => cache.del(key));
    },

};

export default cacheHelper;