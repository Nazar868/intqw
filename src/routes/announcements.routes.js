const { Router } = require('express');

const { authenticate } = require('../middleware/auth.middleware');
const {
  idParamValidator,
  createAnnouncementValidator,
  updateAnnouncementValidator,
} = require('../validators/announcements.validator');
const {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcements.controller');

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Selling a bicycle
 *         description:
 *           type: string
 *           example: Barely used, great condition.
 *         price:
 *           type: number
 *           example: 150
 *         userId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /announcements:
 *   get:
 *     summary: Get all announcements
 *     tags: [Announcements]
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Announcement'
 */
router.get('/', getAnnouncements);

/**
 * @swagger
 * /announcements/{id}:
 *   get:
 *     summary: Get a single announcement by id
 *     tags: [Announcements]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: The requested announcement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', idParamValidator, getAnnouncementById);

/**
 * @swagger
 * /announcements:
 *   post:
 *     summary: Create a new announcement (requires authentication)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, price]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Announcement created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Invalid or expired token
 */
router.post('/', authenticate, createAnnouncementValidator, createAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   patch:
 *     summary: Update an announcement (requires authentication and ownership)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Updated announcement
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Access denied (not the owner)
 *       404:
 *         description: Announcement not found
 */
router.patch('/:id', authenticate, updateAnnouncementValidator, updateAnnouncement);

/**
 * @swagger
 * /announcements/{id}:
 *   delete:
 *     summary: Delete an announcement (requires authentication and ownership)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Announcement deleted
 *       401:
 *         description: Invalid or expired token
 *       403:
 *         description: Access denied (not the owner)
 *       404:
 *         description: Announcement not found
 */
router.delete('/:id', authenticate, idParamValidator, deleteAnnouncement);

module.exports = router;
