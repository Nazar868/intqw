const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

/**
 * Extracts the Bearer access token from the Authorization header,
 * verifies it and attaches the decoded payload to req.user.
 * Any missing/invalid/expired token results in a 401 error.
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: payload.id, username: payload.username };

    next();
  } catch (err) {
    next(createHttpError(401, 'Invalid or expired token'));
  }
}

module.exports = { authenticate };
