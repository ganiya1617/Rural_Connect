'use strict';

const { getPrismaClient } = require('../db');

// GET /api/schemes
async function getSchemes(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { search, type, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      ...(type && { type }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [schemes, total] = await Promise.all([
      prisma.scheme.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.scheme.count({ where }),
    ]);

    res.json({
      success: true, data: schemes,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/jobs
async function getJobs(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { search, type, location, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      isActive: true,
      ...(type && { type }),
      ...(location && { location: { contains: location, mode: 'insensitive' } }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { organization: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true, data: jobs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
}

// Admin CRUD for schemes
async function createScheme(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const scheme = await prisma.scheme.create({ data: req.body });
    res.status(201).json({ success: true, data: scheme });
  } catch (err) { next(err); }
}
async function updateScheme(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const scheme = await prisma.scheme.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: scheme });
  } catch (err) { next(err); }
}
async function deleteScheme(req, res, next) {
  try {
    const prisma = getPrismaClient();
    await prisma.scheme.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Scheme deleted.' });
  } catch (err) { next(err); }
}

// Admin CRUD for jobs
async function createJob(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const job = await prisma.job.create({ data: req.body });
    res.status(201).json({ success: true, data: job });
  } catch (err) { next(err); }
}
async function updateJob(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const job = await prisma.job.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, data: job });
  } catch (err) { next(err); }
}
async function deleteJob(req, res, next) {
  try {
    const prisma = getPrismaClient();
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Job deleted.' });
  } catch (err) { next(err); }
}

module.exports = { getSchemes, getJobs, createScheme, updateScheme, deleteScheme, createJob, updateJob, deleteJob };

