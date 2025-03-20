import type { ServerResponse } from "node:http";
import type { AuthenticatedRequest } from "./authentication";
import type { User } from "../models";

/**
 * AuthorizeRoles is used to check roles names from the request user role.
 * @param {...string[]} roles - The roles that are allowed to access the resource.
 * @returns {Function} A middleware function that checks if the user's role is authorized.
 */
export const authorizeRoles = (...roles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: ServerResponse,
  ): Promise<boolean> => {
    const userRole = (req.User as User).role;

    if (!userRole || !roles.includes(userRole)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return false;
    }
    return true;
  };
};
