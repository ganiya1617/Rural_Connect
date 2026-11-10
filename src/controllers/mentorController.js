'use strict';

const { getPrismaClient } = require('../db');

// GET /api/mentors
async function getMentors(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { search, subject, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      role: 'MENTOR',
      isActive: true,
      mentorProfile: {
        isAvailable: true,
        ...(subject && { subjects: { has: subject } }),
      },
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { mentorProfile: { designation: { contains: search, mode: 'insensitive' } } },
          { mentorProfile: { organization: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [mentors, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { mentorProfile: true },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    const safe = mentors.map(({ password, ...m }) => m);
    res.json({
      success: true,
      data: safe,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/mentors/:id
async function getMentor(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const mentor = await prisma.user.findFirst({
      where: { id: req.params.id, role: 'MENTOR' },
      include: { mentorProfile: true },
    });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });
    const { password, ...safe } = mentor;
    res.json({ success: true, data: safe });
  } catch (err) {
    next(err);
  }
}

// GET /api/mentors/dashboard (for mentor)
async function getMentorDashboard(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const userId = req.user.id;

    const [user, pendingReqs, acceptedReqs, resources] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { mentorProfile: true } }),
      prisma.mentorshipRequest.findMany({
        where: { mentorId: userId, status: 'PENDING' },
        include: { student: { include: { studentProfile: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mentorshipRequest.findMany({
        where: { mentorId: userId, status: 'ACCEPTED' },
        include: { student: { include: { studentProfile: true } } },
      }),
      prisma.resource.findMany({
        where: { uploadedById: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    const { password, ...safeUser } = user;
    res.json({
      success: true,
      data: {
        user: safeUser,
        stats: {
          pendingRequests: pendingReqs.length,
          connectedStudents: acceptedReqs.length,
          resourcesUploaded: resources.length,
        },
        pendingRequests: pendingReqs.map(r => ({ ...r, student: { ...r.student, password: undefined } })),
        connectedStudents: acceptedReqs.map(r => ({ ...r, student: { ...r.student, password: undefined } })),
        recentResources: resources,
      },
    });
  } catch (err) {
    next(err);
  }
}

// PUT /api/mentors/profile
async function updateMentorProfile(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { name, bio, designation, organization, expertise, subjects,
            qualifications, experience, location, linkedIn, website, isAvailable } = req.body;

    await prisma.user.update({ where: { id: req.user.id }, data: { name } });

    const profile = await prisma.mentorProfile.upsert({
      where: { userId: req.user.id },
      create: {
        userId: req.user.id, bio, designation, organization,
        expertise: Array.isArray(expertise) ? expertise : [],
        subjects: Array.isArray(subjects) ? subjects : [],
        qualifications: Array.isArray(qualifications) ? qualifications : [],
        experience: parseInt(experience) || 0,
        location, linkedIn, website,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
      update: {
        bio, designation, organization,
        expertise: Array.isArray(expertise) ? expertise : [],
        subjects: Array.isArray(subjects) ? subjects : [],
        qualifications: Array.isArray(qualifications) ? qualifications : [],
        experience: parseInt(experience) || 0,
        location, linkedIn, website,
        isAvailable: isAvailable !== undefined ? isAvailable : true,
      },
    });

    res.json({ success: true, message: 'Profile updated.', data: profile });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMentors, getMentor, getMentorDashboard, updateMentorProfile };

