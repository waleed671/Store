import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware';
import User from '../modules/users/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'chronex_lunarix_jwt_secret_2026_xK9mN3pQ';

interface JwtPayload { id: string; role: string; }

declare global {
  namespace Express {
    interface Request { user?: any; }
  }
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next(new AppError('Not authenticated', 401));

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user) return next(new AppError('User not found', 401));
    if (user.isBlocked) return next(new AppError('Account suspended', 403));
    req.user = user;
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
};

export const authorize = (...roles: string[]) => (
  req: Request, _res: Response, next: NextFunction
) => {
  if (!roles.includes(req.user?.role)) {
    return next(new AppError('Insufficient permissions', 403));
  }
  next();
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = await User.findById(decoded.id).select('-password');
  } catch {}
  next();
};
