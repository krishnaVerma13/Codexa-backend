import type { NextFunction, Request, Response } from 'express';
import asyncHandler from 'express-async-handler'
import { ApiError } from '../utils/ApiError.js';
import { JwtToken } from '../config/Jwt.js';
import { userRepo } from '../repository/user.repo.js';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

export const AuthMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    // 1. Extract token from header or cookie
    const token =
      req.cookies?.accessToken ||
      req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    // 2. Verify and decode
    const decoded = await JwtToken.verifyToken(token) ;

    // 3. Confirm user still exists in DB
    const user = await userRepo.findById(decoded.userId);
    if (user.success == false) {
      throw new ApiError(401, "Unauthorized: User no longer exists");
    }

    // 4. Attach to request
    req.user= {
        userId: decoded.userId,
        email: user.data?.email!,
        role: user.data?.role!,
    }

    next();
  }
);

// ─── Role Guard ────────────────────────────────────────────────────────────────
// export const authorizeRoles = (...roles: ("Developer" | "Admin")[]) =>
//   asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
//     if (!req.user || !roles.includes(req.user.role )) {
//       throw new ApiError(403, "Forbidden: Insufficient permissions");
//     }
//     next();
//   });