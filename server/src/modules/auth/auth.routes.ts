import { Router } from 'express';
import { register, login, logout, getMe, refreshToken, forgotPassword, resetPassword } from './auth.controller';
import { protect } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.post('/refresh',  refreshToken);
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

export default router;
