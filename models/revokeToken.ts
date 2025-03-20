const revokedTokens: Set<string> = new Set();

/**
 * Add a token to the revoked tokens list.
 *
 * @param {string} token - The token to revoke.
 */
export const addRevokeToken = (token: string): void => {
  revokedTokens.add(token);
};

/**
 * Check if a token is revoked.
 *
 * @param {string} token - The token to check.
 * @return {boolean} - True if the token is revoked, otherwise false.
 */
export const isTokenRevoked = (token: string): boolean => {
  return revokedTokens.has(token);
};
