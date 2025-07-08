import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

interface CacheOptions {
    ttl?: number;
    keyPrefix?: string;
}

export function Cache(options: CacheOptions = {}) {
    const { ttl = 60, keyPrefix = 'cache' } = options;

    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const redisClient = new Redis({
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            });

            const key = `${keyPrefix}:${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;

            try {
                const cached = await redisClient.get(key);
                if (cached && process.env.NODE_ENV != 'test') {
                    await redisClient.quit();
                    return JSON.parse(cached);
                }

                const result = await originalMethod.apply(this, args);

                await redisClient.setex(key, ttl, JSON.stringify(result));
                await redisClient.quit();

                return result;
            } catch (error) {
                await redisClient.quit();
                return originalMethod.apply(this, args);
            }
        };

        return descriptor;
    };
}