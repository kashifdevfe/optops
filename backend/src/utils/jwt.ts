import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthTokenPayload } from '../types/index.js';

export const generateAccessToken = (payload: { companyId: string; userId: string; email: string }): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

export const generateRefreshToken = (payload: { companyId: string }): string => {
  return jwt.sign({ companyId: payload.companyId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as AuthTokenPayload;
};
