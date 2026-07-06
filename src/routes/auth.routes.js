const { Router } = require('express');

const { authenticate } = require('../middleware/auth.middleware');
const {
  registerValidator,
  loginValidator,
  refreshValidator,
} = require('../validators/auth.validator');
const {
  register,
  login,
  refresh,
  logout,
  getMe,
} = require('../controllers/auth.controller');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     PublicUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         username:
 *           type: string
 *           example: ivan_petrenko
 *         name:
 *           type: string
 *           example: Іван
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/PublicUser'
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, name]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: ivan_petrenko
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Іван
 *     responses:
 *       201:
 *         description: User registered successfully, tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *       409:
 *         description: User with this username already exists
 */
router.post('/register', registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: ivan_petrenko
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful, new tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', loginValidator, login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh the access/refresh token pair
 *     description: >
 *       Accepts a refresh token either from the `refreshToken` HttpOnly cookie
 *       or from the request body. Performs refresh token rotation.
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: New access/refresh token pair
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Missing, invalid or expired refresh token
 */
router.post('/refresh', refreshValidator, refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out and invalidate the current refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Invalid or expired token
 */
router.post('/logout', authenticate, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the currently authenticated user's profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Invalid or expired token
 */
router.get('/me', authenticate, getMe);

module.exports = router;
