import type { IncomingMessage } from "http";
import { StringDecoder } from "string_decoder";

/**
 * Parses the body of an incoming request.
 * @param {IncomingMessage} req - Incoming request object.
 * @returns {Function} - Returns a promise that resolves to the parsed body of the request.
 */
export const parseBody = (req: IncomingMessage): Promise<any> => {
  return new Promise((resolve, reject) => {
    const decoder = new StringDecoder("utf-8");
    let buffer = "";

    req.on("data", (chunk) => {
      buffer += decoder.write(chunk);
    });

    req.on("end", () => {
      buffer += decoder.end();
      try {
        resolve(JSON.parse(buffer));
      } catch (error) {
        reject(error);
      }
    });
  });
};
