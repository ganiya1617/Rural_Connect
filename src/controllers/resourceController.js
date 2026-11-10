'use strict';

const { getPrismaClient } = require('../db');

// GET /api/resources
async function getResources(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { search, subject, type, difficulty, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isPublished: true,
      ...(subject && { subject: { equals: subject, mode: 'insensitive' } }),
      ...(type && { type }),
      ...(difficulty && { difficulty }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search.toLowerCase() } },
        ],
      }),
    };

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { name: true, role: true } } },
      }),
      prisma.resource.count({ where }),
    ]);

    res.json({
      success: true,
      data: resources,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/:id
async function getResource(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id },
      include: { uploadedBy: { select: { name: true } } },
    });
    if (!resource || !resource.isPublished) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    // Increment view count
    await prisma.resource.update({ where: { id: resource.id }, data: { viewCount: { increment: 1 } } });
    res.json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

// POST /api/resources/:id/bookmark
async function toggleBookmark(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const existing = await prisma.bookmark.findUnique({
      where: { userId_resourceId: { userId: req.user.id, resourceId: req.params.id } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return res.json({ success: true, bookmarked: false, message: 'Bookmark removed.' });
    }

    await prisma.bookmark.create({ data: { userId: req.user.id, resourceId: req.params.id } });
    res.json({ success: true, bookmarked: true, message: 'Resource bookmarked.' });
  } catch (err) {
    next(err);
  }
}

// POST /api/resources/:id/complete
async function markComplete(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const existing = await prisma.completedResource.findUnique({
      where: { userId_resourceId: { userId: req.user.id, resourceId: req.params.id } },
    });

    if (existing) {
      return res.json({ success: true, message: 'Already marked as complete.' });
    }

    await prisma.completedResource.create({ data: { userId: req.user.id, resourceId: req.params.id } });
    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'COMPLETE_RESOURCE',
        description: 'Completed a learning resource',
        metadata: { resourceId: req.params.id },
      },
    });

    res.json({ success: true, message: 'Resource marked as complete!' });
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/bookmarks
async function getBookmarks(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: req.user.id },
      include: { resource: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: bookmarks });
  } catch (err) {
    next(err);
  }
}

// GET /api/resources/subjects
async function getSubjects(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const subjects = await prisma.resource.findMany({
      where: { isPublished: true },
      select: { subject: true },
      distinct: ['subject'],
    });
    res.json({ success: true, data: subjects.map(s => s.subject) });
  } catch (err) {
    next(err);
  }
}

// POST /api/resources (mentor/admin)
async function createResource(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { title, description, type, subject, topic, url, thumbnailUrl, difficulty, tags } = req.body;

    const resource = await prisma.resource.create({
      data: {
        title, description, type, subject, topic, url, thumbnailUrl,
        difficulty: difficulty || 'BEGINNER',
        tags: Array.isArray(tags) ? tags : [],
        uploadedById: req.user.id,
      },
    });
    res.status(201).json({ success: true, message: 'Resource created.', data: resource });
  } catch (err) {
    next(err);
  }
}

// PUT /api/resources/:id (mentor/admin)
async function updateResource(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const resource = await prisma.resource.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, message: 'Resource updated.', data: resource });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/resources/:id (admin)
async function deleteResource(req, res, next) {
  try {
    const prisma = getPrismaClient();
    await prisma.resource.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Resource deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getResources, getResource, toggleBookmark, markComplete,
  getBookmarks, getSubjects, createResource, updateResource, deleteResource,
};

