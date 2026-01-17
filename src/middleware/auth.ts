import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET || 'your_secret_key';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
};

export const checkUserRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).send('Access denied');
        }
        next();
    };
};