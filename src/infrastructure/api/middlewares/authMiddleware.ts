import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@shared/services/AuthService';
import { ERROR_MESSAGES } from '@shared/constants/messages.constants';

const authService = new AuthService();

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      return;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      return;
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      return;
    }

    const decoded = authService.verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(401).json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
  }
};
