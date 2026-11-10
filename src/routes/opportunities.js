'use strict';

const router = require('express').Router();
const {
  getSchemes, getJobs,
  createScheme, updateScheme, deleteScheme,
  createJob, updateJob, deleteJob,
} = require('../controllers/opportunityController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/schemes', getSchemes);
router.get('/jobs', getJobs);

// Admin
router.post('/schemes', authenticate, authorize('ADMIN'), createScheme);
router.put('/schemes/:id', authenticate, authorize('ADMIN'), updateScheme);
router.delete('/schemes/:id', authenticate, authorize('ADMIN'), deleteScheme);

router.post('/jobs', authenticate, authorize('ADMIN'), createJob);
router.put('/jobs/:id', authenticate, authorize('ADMIN'), updateJob);
router.delete('/jobs/:id', authenticate, authorize('ADMIN'), deleteJob);

module.exports = router;

