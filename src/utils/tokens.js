const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Generates a short-lived access token for a user.
 * @param {{id: number, username: string}} user
 * @returns {string}
 */
function generateAccessToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

/**
 * Generates a long-lived refresh token for a user.
 * @param {{id: number, username: string}} user
 * @returns {string}
 */
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_MAX_AGE_MS,
};
