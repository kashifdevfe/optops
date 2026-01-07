import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { AuthTokenPayload } from '../types/index.js';

export const generateAccessToken = (payload: { companyId: string; userId: string; email: string }): string => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: { companyId: string }): string => {
  return jwt.sign({ companyId: payload.companyId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwt.secret as string) as AuthTokenPayload;
};

export const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, config.jwt.refreshSecret as string) as AuthTokenPayload;
};
