'use strict';

const { getPrismaClient } = require('../db');

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const [students, mentors, resources, schemes, jobs, quizzes, attempts, activities] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'MENTOR' } }),
      prisma.resource.count(),
      prisma.scheme.count(),
      prisma.job.count(),
      prisma.quiz.count(),
      prisma.quizAttempt.count(),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    res.json({
      success: true,
      data: {
        stats: { students, mentors, resources, schemes, jobs, quizzes, quizAttempts: attempts },
        recentActivities: activities,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/users
async function getUsers(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true, data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/users/:id/toggle
async function toggleUser(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true },
    });
    res.json({ success: true, message: `User ${updated.isActive ? 'activated' : 'deactivated'}.`, data: updated });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const prisma = getPrismaClient();
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'User deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStats, getUsers, toggleUser, deleteUser };

