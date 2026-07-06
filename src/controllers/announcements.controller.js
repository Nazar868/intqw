const createHttpError = require('http-errors');
const prisma = require('../../prisma/client');

async function getAnnouncements(req, res, next) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(announcements);
  } catch (err) {
    next(err);
  }
}

async function getAnnouncementById(req, res, next) {
  try {
    const id = Number(req.params.id);

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw createHttpError(404, 'Announcement not found');
    }

    res.status(200).json(announcement);
  } catch (err) {
    next(err);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const { title, description, price } = req.body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        price,
        userId: req.user.id,
      },
    });

    res.status(201).json(announcement);
  } catch (err) {
    next(err);
  }
}

async function updateAnnouncement(req, res, next) {
  try {
    const id = Number(req.params.id);

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw createHttpError(404, 'Announcement not found');
    }

    if (announcement.userId !== req.user.id) {
      throw createHttpError(403, 'Access denied');
    }

    const updated = await prisma.announcement.update({
      where: { id },
      data: req.body,
    });

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const id = Number(req.params.id);

    const announcement = await prisma.announcement.findUnique({ where: { id } });
    if (!announcement) {
      throw createHttpError(404, 'Announcement not found');
    }

    if (announcement.userId !== req.user.id) {
      throw createHttpError(403, 'Access denied');
    }

    await prisma.announcement.delete({ where: { id } });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
