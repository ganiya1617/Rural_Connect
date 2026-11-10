'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getPrismaClient } = require('../db');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// POST /api/auth/register/student
async function registerStudent(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { name, email, password, village, district, state, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
        studentProfile: {
          create: { village, district, state, phone },
        },
      },
      include: { studentProfile: true },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'REGISTER',
        description: 'Student registered on RuralConnect',
      },
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to RuralConnect.',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/register/mentor
async function registerMentor(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { name, email, password, designation, organization, expertise, subjects, experience, location, bio } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'MENTOR',
        mentorProfile: {
          create: {
            designation,
            organization,
            bio: bio || '',
            expertise: Array.isArray(expertise) ? expertise : (expertise ? [expertise] : []),
            subjects: Array.isArray(subjects) ? subjects : (subjects ? [subjects] : []),
            experience: parseInt(experience) || 0,
            location: location || '',
          },
        },
      },
      include: { mentorProfile: true },
    });

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'REGISTER',
        description: 'Mentor registered on RuralConnect',
      },
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Mentor registration successful!',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Contact support.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    await prisma.activity.create({
      data: {
        userId: user.id,
        type: 'LOGIN',
        description: `${user.role} logged in`,
      },
    });

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: safeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: true,
        mentorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user: safeUser(user) });
  } catch (err) {
    next(err);
  }
}

// PUT /api/auth/change-password
async function changePassword(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const hashed = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerStudent, registerMentor, login, getMe, changePassword };

