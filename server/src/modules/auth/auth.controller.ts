import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../users/user.model';
import { AppError } from '../../middleware/error.middleware';
import { sendEmail } from '../../utils/mailer';

const JWT_SECRET = process.env.JWT_SECRET || 'chronex_lunarix_jwt_secret_2026_xK9mN3pQ';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'chronex_lunarix_refresh_secret_2026_rT7vL4wM';

const signToken = (id: string, role: string) =>
  jwt.sign({ id, role }, JWT_SECRET, { expiresIn: (process.env.JWT_EXPIRE || '7d') as any });

const signRefreshToken = (id: string) =>
  jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') as any });

const sendTokens = (res: Response, user: any, statusCode = 200) => {
  const token = signToken(user._id.toString(), user.role);
  const refreshToken = signRefreshToken(user._id.toString());

  res.status(statusCode).json({
    success: true,
    token,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isVerified: user.isVerified,
      loyaltyPoints: user.loyaltyPoints,
    },
  });
};

// POST /api/auth/register
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return next(new AppError('Email already registered', 400));

    const user = await User.create({ name, email, password, phone });
    sendTokens(res, user, 201);
  } catch (err) { next(err); }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return next(new AppError('Invalid credentials', 401));
    if (user.isBlocked) return next(new AppError('Account suspended', 403));

    const valid = await user.comparePassword(password);
    if (!valid) return next(new AppError('Invalid credentials', 401));

    // Save refresh token
    user.refreshToken = signRefreshToken(user._id.toString());
    await user.save({ validateBeforeSave: false });

    sendTokens(res, user);
  } catch (err) { next(err); }
};

// POST /api/auth/refresh
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return next(new AppError('Refresh token required', 401));

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
    const user = await User.findById(decoded.id);
    if (!user) return next(new AppError('Invalid token', 401));

    const newToken = signToken(user._id.toString(), user.role);
    res.json({ success: true, token: newToken });
  } catch {
    next(new AppError('Invalid refresh token', 401));
  }
};

// POST /api/auth/logout
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    res.json({ success: true, message: 'Logged out' });
  } catch (err) { next(err); }
};

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  res.json({ success: true, user: req.user });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return next(new AppError('No user with that email', 404));

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'CHRONEX — Password Reset',
      html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a> (valid 15 min)</p>`,
    });

    res.json({ success: true, message: 'Reset email sent' });
  } catch (err) { next(err); }
};

// POST /api/auth/reset-password/:token
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return next(new AppError('Token invalid or expired', 400));

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendTokens(res, user);
  } catch (err) { next(err); }
};
