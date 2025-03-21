import type { IncomingMessage, ServerResponse } from "http";
import {
  addRevokeToken,
  authSchema,
  createUser,
  findUserByEmail,
  HttpMethod,
  HttpStatus,
  revokeToken,
  validatePassword,
} from "../models";
import { parseBody } from "../utils/parser";
import { safeParse } from "valibot";
import { sign } from "jsonwebtoken";
import { config } from "../config";
import type { AuthenticatedRequest } from "../middlewares/authentication";

/**
 * AuthRouter handles the authentication routes.
 * @param {IncomingMessage} req - The request object.
 * @param {ServerResponse} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the request is handled.
 */
export const authRouter = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  const { method, url } = req;

  if (url == "/auth/register" && method === HttpMethod.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);
    if (result.issues) {
      res.statusCode = HttpStatus.BAD_REQUEST;
      res.end(JSON.stringify({ message: "Bad request" }));
      return;
    }

    const { email, password } = result.output;

    try {
      const user = await createUser(email, password);
      res.statusCode = HttpStatus.CREATED;
      res.end(JSON.stringify(user));
    } catch (err) {
      if (err instanceof Error) {
        res.statusCode = HttpStatus.BAD_REQUEST;
        res.end(JSON.stringify({ message: err.message }));
      } else {
        res.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        res.end(JSON.stringify({ message: "Internal server error" }));
      }
    }
  }

  if (url == "/auth/login" && method === HttpMethod.POST) {
    const body = await parseBody(req);
    const result = safeParse(authSchema, body);

    if (result.issues) {
      res.statusCode = HttpStatus.BAD_REQUEST;
      res.end(JSON.stringify({ message: "Bad request" }));
      return;
    }

    const { email, password } = result.output;
    const user = findUserByEmail(email);

    if (!user || !(await validatePassword(user, password))) {
      res.statusCode = HttpStatus.UNAUTHORIZED;
      res.end(JSON.stringify({ message: "Invalid credentials" }));
      return;
    }

    const accessToken = sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: "1h" },
    );

    const refreshToken = sign({ id: user.id }, config.jwtSecret, {
      expiresIn: "1d",
    });

    user.refreshToken = refreshToken;
    res.statusCode = HttpStatus.OK;
    res.end(JSON.stringify({ accessToken, refreshToken }));
    return;
  }

  if (url == "/auth/logout" && method === HttpMethod.POST) {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      addRevokeToken(token);
      const formattedReq = req as AuthenticatedRequest;
      if (
        formattedReq.user &&
        typeof formattedReq.user === "object" &&
        "id" in formattedReq.user
      ) {
        const result = revokeToken(formattedReq.user.email);
        if (!result) {
          res.statusCode = HttpStatus.FORBIDDEN;
          res.end(JSON.stringify({ message: "Forbidden" }));
        }
      }
      res.statusCode = HttpStatus.OK;
      res.end(JSON.stringify({ message: "Logged out" }));
      return;
    }
  }
  res.statusCode = HttpStatus.NOT_FOUND;
  res.end(JSON.stringify({ message: "Endpoint not found" }));
};
