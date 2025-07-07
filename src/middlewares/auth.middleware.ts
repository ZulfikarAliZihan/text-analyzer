import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { verifyToken } from '../utils/jwt';

@Service()
export class AuthMiddleware implements ExpressMiddlewareInterface {
    use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            req['user'] = null;
            return res.status(401).json({ message: 'Token missing' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token)
        if (!decoded) return res.status(403).json({ message: 'Invalid token' });
        req['user'] = decoded;
        next();

    }
}