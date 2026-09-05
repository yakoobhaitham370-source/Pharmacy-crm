import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleSheetRepository } from '../repositories/baseRepository.js';
import { SHEET_NAMES } from '../services/google-sheets.js';

interface UserRecord {
  'User ID': string;
  'Name': string;
  'Username': string;
  'Password Hash': string;
  'Role': string;
  'Status': string;
  'Created At': string;
  'Last Login'?: string;
}

const userRepository = new GoogleSheetRepository<UserRecord>(SHEET_NAMES.USERS);

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Username and password are required' } });
    }

    const user = await userRepository.findOneBy({ 'Username': username, 'Status': 'Active' });

    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    const isMatch = await bcrypt.compare(password, user['Password Hash']);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });
    }

    // Update last login
    await userRepository.update('User ID', user['User ID'], { 'Last Login': new Date().toISOString() });

    const token = jwt.sign(
      { userId: user['User ID'], username: user['Username'], name: user['Name'], role: user['Role'] },
      process.env.SESSION_SECRET!,
      { expiresIn: '12h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 12 * 60 * 60 * 1000 // 12 hours
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user['User ID'],
          name: user['Name'],
          username: user['Username'],
          role: user['Role']
        },
        token // Return token for API clients if needed, though cookies are preferred
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_SERVER_ERROR', message: 'An error occurred during login' } });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

export const getMe = (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
};
