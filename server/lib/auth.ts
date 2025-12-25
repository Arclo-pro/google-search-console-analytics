import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

// Support multiple naming conventions
const JWT_SECRET = process.env.TRAFFIC_DOCTOR_API_KEY || process.env.JWT_SHARED_SECRET || "";

export interface JWTPayload {
  [key: string]: any;
}

export function verifyJWT(token: string): JWTPayload {
  if (!JWT_SECRET) {
    throw new Error("JWT_SHARED_SECRET not configured");
  }
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as JWTPayload;
}

export function signJWT(payload: JWTPayload): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SHARED_SECRET not configured");
  }
  return jwt.sign(payload, JWT_SECRET, { algorithm: "HS256", expiresIn: "5m" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Support both x-api-key (preferred) and Authorization: Bearer (fallback)
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const authHeader = req.headers.authorization;
  
  const unauthorizedResponse = {
    ok: false,
    error: { code: "unauthorized", message: "Invalid API key" }
  };
  
  // Check x-api-key first (preferred - simple key comparison)
  if (apiKey) {
    if (apiKey === JWT_SECRET) {
      req.user = { authenticated: true, method: "api-key" };
      return next();
    }
    return res.status(401).json(unauthorizedResponse);
  }
  
  // Fall back to Bearer token (can be raw key or JWT)
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    
    // First try as raw API key
    if (token === JWT_SECRET) {
      req.user = { authenticated: true, method: "bearer-key" };
      return next();
    }
    
    // Then try as JWT
    try {
      req.user = verifyJWT(token);
      return next();
    } catch (error) {
      return res.status(401).json(unauthorizedResponse);
    }
  }
  
  return res.status(401).json(unauthorizedResponse);
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
