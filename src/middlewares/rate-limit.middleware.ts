import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import Redis from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();

@Service()
export class RateLimitMiddleware implements ExpressMiddlewareInterface {
    private redisClient: Redis;

    constructor() {
        this.redisClient = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }

    use(req: Request, res: Response, next: NextFunction): void {
        if (process.env.NODE_ENV === 'test') {
            return next();
        }

        const userId = req['user']?.userId || req.ip;
        const key = `rate_limit:${userId}:${req.path}`;

        this.redisClient
            .multi()
            .incr(key)
            .expire(key, 60)
            .exec()
            .then((results) => {
                const [incrErr, incrCount] = results?.[0] || [];

                if (incrErr) return next();

                if ((incrCount as number) > 100) {
                    return res.status(429).json({ error: 'Too many requests' });
                }

                next();
            })
            .catch(() => {
                next();
            });
    }
}