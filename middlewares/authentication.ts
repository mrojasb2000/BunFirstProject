import type { IncomingMessage, ServerResponse } from "http";
import { verify, type JwtPayload } from "jsonwebtoken";
import { isTokenRevoked } from "../models";
import { config } from "../config";

/**
 * AuthenticatedRequest extends IncomingMessage from http package, add user property to it.
 * - user property can be JwtPayload or string.
 */
export interface AuthenticatedRequest extends IncomingMessage {
  user?: JwtPayload | string;
}

/**
 * AuthenticateToken function is used to authenticate the token from the request headers.
 * @param req - Request object from the client.
 * @param res - Response object to send the response back to the client.
 * @returns - Returns a boolean value, true if the token is valid, false otherwise.
 */
export const AuthenticateToken = async (
  req: AuthenticatedRequest,
  res: ServerResponse,
): Promise<boolean> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.statusCode = 401;
    res.end(JSON.stringify({ message: "Unauthorized" }));
    return false;
  }

  if (isTokenRevoked(token)) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: "Forbidden" }));
    return false;
  }

  try {
    const decoded = verify(token, config.jwtSecret);
    req.user = decoded;
    return true;
  } catch (_error) {
    res.statusCode = 403;
    res.end(JSON.stringify({ message: "Forbidden" }));
    return false;
  }
};
