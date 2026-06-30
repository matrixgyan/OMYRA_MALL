export interface OmyraUser {
  id: string;
  email: string;
  display_name?: string;
  role: string;
  email_verified: boolean;
  created_at: string;
}

export interface OmyraSession {
  token: string;
  refreshToken: string;
  user: OmyraUser;
  expiresAt: number;
}

export class OmyraAuthClient {
  apiKey: string;
  constructor(config?: { apiKey?: string });
  onEvent(event: string, callback: (...args: any[]) => void): void;
  emitEvent(event: string, ...args: any[]): void;
  register(data: { email: string; password?: string; display_name?: string }): Promise<OmyraUser>;
  login(data: { email: string; password?: string }): Promise<OmyraSession>;
  createSession(user: OmyraUser): Promise<OmyraSession>;
  validateSession(token: string): Promise<OmyraUser>;
  refreshSession(refreshToken: string): Promise<OmyraSession>;
  logout(token: string): Promise<boolean>;
  forgotPassword(email: string): Promise<{ success: boolean; resetToken: string }>;
  resetPassword(token: string, newPassword?: string): Promise<boolean>;
  verifyEmail(token: string): Promise<boolean>;
  sendEmailVerification(email: string): Promise<boolean>;
  getUser(userId: string): Promise<OmyraUser>;
  getMe(token: string): Promise<OmyraUser>;
  validatePermissions(userId: string, permissions: string[]): Promise<boolean>;
  logSecurityEvent(event: { userId?: string; eventType: string; ipAddress: string; userAgent: string; details?: any }): Promise<void>;
}
