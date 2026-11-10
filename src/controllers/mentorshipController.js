'use strict';

const { getPrismaClient } = require('../db');

// POST /api/mentorship/request
async function sendRequest(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { mentorId, message } = req.body;

    const mentor = await prisma.user.findFirst({ where: { id: mentorId, role: 'MENTOR' } });
    if (!mentor) return res.status(404).json({ success: false, message: 'Mentor not found.' });

    const existing = await prisma.mentorshipRequest.findUnique({
      where: { studentId_mentorId: { studentId: req.user.id, mentorId } },
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already sent a request to this mentor.' });
    }

    const request = await prisma.mentorshipRequest.create({
      data: { studentId: req.user.id, mentorId, message },
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'MENTORSHIP_REQUEST',
        description: `Sent mentorship request to ${mentor.name}`,
      },
    });

    res.status(201).json({ success: true, message: 'Mentorship request sent!', data: request });
  } catch (err) {
    next(err);
  }
}

// GET /api/mentorship/my-requests (student)
async function getMyRequests(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const requests = await prisma.mentorshipRequest.findMany({
      where: { studentId: req.user.id },
      include: { mentor: { include: { mentorProfile: true }, select: { id: true, name: true, email: true, mentorProfile: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

// GET /api/mentorship/incoming (mentor)
async function getIncomingRequests(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const requests = await prisma.mentorshipRequest.findMany({
      where: { mentorId: req.user.id },
      include: {
        student: {
          select: { id: true, name: true, email: true, studentProfile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/mentorship/:id/respond (mentor)
async function respondToRequest(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be ACCEPTED or REJECTED.' });
    }

    const request = await prisma.mentorshipRequest.findFirst({
      where: { id: req.params.id, mentorId: req.user.id },
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    const updated = await prisma.mentorshipRequest.update({
      where: { id: req.params.id },
      data: { status },
    });

    // Update mentor student count
    if (status === 'ACCEPTED') {
      await prisma.mentorProfile.update({
        where: { userId: req.user.id },
        data: { totalStudents: { increment: 1 } },
      });
      await prisma.activity.create({
        data: {
          userId: request.studentId,
          type: 'MENTORSHIP_ACCEPTED',
          description: 'Your mentorship request was accepted!',
        },
      });
    }

    res.json({ success: true, message: `Request ${status.toLowerCase()}.`, data: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendRequest, getMyRequests, getIncomingRequests, respondToRequest };

