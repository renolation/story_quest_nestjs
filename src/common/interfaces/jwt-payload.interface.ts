import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  username: string;
  role: UserRole;
  iat?: number; // Issued at
  exp?: number; // Expiration
}
