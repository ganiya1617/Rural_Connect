'use strict';

const { getPrismaClient } = require('../db');

// GET /api/students/dashboard
async function getDashboard(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;

    const [user, bookmarks, completed, attempts, activities] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { studentProfile: true },
      }),
      prisma.bookmark.count({ where: { userId } }),
      prisma.completedResource.count({ where: { userId } }),
      prisma.quizAttempt.findMany({
        where: { userId },
        include: { quiz: { select: { title: true, subject: true } } },
        orderBy: { submittedAt: 'desc' },
        take: 5,
      }),
      prisma.activity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const avgScore = attempts.length
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
      : 0;

    res.json({
      success: true,
      data: {
        user: { id: user.id, name: user.name, email: user.email, profile: user.studentProfile },
        stats: {
          bookmarks,
          completedResources: completed,
          quizzesTaken: attempts.length,
          averageScore: avgScore,
        },
        recentAttempts: attempts,
        recentActivities: activities,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/profile
async function getProfile(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { studentProfile: true },
    });
    const { password, ...safe } = user;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
}

// PUT /api/students/profile
async function updateProfile(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { name, phone, address, village, district, state, pincode,
            dateOfBirth, gender, class: cls, school, board, percentage,
            interests, bio } = req.body;

    await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
    });

    const profile = await prisma.studentProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id,
        phone, address, village, district, state, pincode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender, class: cls, school, board,
        percentage: percentage ? parseFloat(percentage) : undefined,
        interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
        bio,
      },
      update: {
        phone, address, village, district, state, pincode,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender, class: cls, school, board,
        percentage: percentage ? parseFloat(percentage) : undefined,
        interests: Array.isArray(interests) ? interests : (interests ? [interests] : []),
        bio,
      },
    });

    res.json({ success: true, message: 'Profile updated successfully.', data: profile });
  } catch (err) {
    next(err);
  }
}

// GET /api/students/progress
async function getProgress(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;

    const [completed, attempts, totalResources] = await Promise.all([
      prisma.completedResource.findMany({
        where: { userId },
        include: { resource: { select: { title: true, subject: true, type: true } } },
        orderBy: { completedAt: 'desc' },
      }),
      prisma.quizAttempt.findMany({
        where: { userId },
        include: { quiz: { select: { title: true, subject: true, totalMarks: true } } },
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.resource.count({ where: { isPublished: true } }),
    ]);

    const subjectProgress = {};
    completed.forEach(c => {
      const sub = c.resource.subject;
      subjectProgress[sub] = (subjectProgress[sub] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        completedResources: completed,
        totalResources,
        progressPercentage: totalResources > 0 ? Math.round((completed.length / totalResources) * 100) : 0,
        quizAttempts: attempts,
        subjectProgress,
        averageScore: attempts.length
          ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
          : 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getProfile, updateProfile, getProgress };

