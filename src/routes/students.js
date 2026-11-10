'use strict';

const router = require('express').Router();
const { getDashboard, getProfile, updateProfile, getProgress } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('STUDENT'));

router.get('/dashboard', getDashboard);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/progress', getProgress);

module.exports = router;

