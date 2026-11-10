'use strict';

const router = require('express').Router();
const { getMentors, getMentor, getMentorDashboard, updateMentorProfile } = require('../controllers/mentorController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', getMentors);
router.get('/:id', getMentor);

// Mentor-only
router.get('/me/dashboard', authenticate, authorize('MENTOR'), getMentorDashboard);
router.put('/me/profile', authenticate, authorize('MENTOR'), updateMentorProfile);

module.exports = router;

