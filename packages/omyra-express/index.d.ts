import { Request, Response, NextFunction } from 'express';
import { OmyraAuthClient, OmyraUser } from '@omyra/server';

declare global {
  namespace Express {
    interface Request {
      omyraUser?: OmyraUser;
      omyraSessionToken?: string;
    }
  }
}

export function omyraAuthMiddleware(omyraClient: OmyraAuthClient): (req: Request, res: Response, next: NextFunction) => void;
export function requireOmyraSession(req: Request, res: Response, next: NextFunction): void;
