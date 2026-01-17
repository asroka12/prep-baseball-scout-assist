import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateScoutingReport = [
    body('playerId').isString().withMessage('Player ID must be a string'),
    body('notes').isString().withMessage('Notes must be a string'),
    body('createdAt').isISO8601().withMessage('Created At must be a valid date'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateNote = [
    body('userId').isString().withMessage('User ID must be a string'),
    body('content').isString().withMessage('Content must be a string'),
    body('createdAt').isISO8601().withMessage('Created At must be a valid date'),
    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];