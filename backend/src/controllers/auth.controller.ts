import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { config } from '../config/env.js';

export const authController = {
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.signup(req.body);

      res.cookie('accessToken', result.accessToken, config.cookie);
      res.cookie('refreshToken', result.refreshToken, config.cookie);

      res.status(201).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        company: result.company,
        user: result.user,
        themeSettings: result.themeSettings,
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'An error occurred during signup';
      res.status(400).json({ error: errorMessage });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.login(req.body);

      res.cookie('accessToken', result.accessToken, config.cookie);
      res.cookie('refreshToken', result.refreshToken, config.cookie);

      res.json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        company: result.company,
        user: result.user,
        themeSettings: result.themeSettings,
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshToken(refreshToken);

      res.cookie('accessToken', result.accessToken, config.cookie);
      res.cookie('refreshToken', result.refreshToken, config.cookie);

      res.json({
        success: true,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.resetCompanyPassword(email);
      res.json({
        message: result.message || 'Password reset email sent successfully',
        email: result.email,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async resetPassword(_req: Request, _res: Response): Promise<void> {
    _res.status(501).json({ error: 'Not implemented' });
  },
};
