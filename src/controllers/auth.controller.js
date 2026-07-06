const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const createHttpError = require('http-errors');

const prisma = require('../../prisma/client');
const {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_MAX_AGE_MS,
} = require('../utils/tokens');

const SALT_ROUNDS = 10;

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
  };
}

async function register(req, res, next) {
  try {
    const { username, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      throw createHttpError(409, 'User with this username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id },
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, 'Invalid credentials');
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Replace any previously issued refresh token(s) for this user.
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id },
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      user: toPublicUser(user),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      throw createHttpError(401, 'Refresh token is required');
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      throw createHttpError(401, 'Invalid or expired refresh token');
    }

    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken) {
      throw createHttpError(401, 'Invalid refresh token');
    }

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) {
      throw createHttpError(401, 'Invalid refresh token');
    }

    // Token rotation: delete the old refresh token before issuing a new one.
    await prisma.refreshToken.delete({ where: { token } });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    // req.user is populated by the `authenticate` middleware.
    await prisma.refreshToken.deleteMany({ where: { userId: req.user.id } });

    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    res.status(200).json({
      id: user.id,
      username: user.username,
      name: user.name,
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
