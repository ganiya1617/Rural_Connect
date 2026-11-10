'use strict';

const router = require('express').Router();
const {
  getResources, getResource, toggleBookmark, markComplete,
  getBookmarks, getCompleted, getSubjects, createResource, updateResource, deleteResource,
} = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', getResources);
router.get('/subjects', getSubjects);

// Student/Mentor protected
router.get('/me/bookmarks', authenticate, getBookmarks);
router.get('/me/completed', authenticate, getCompleted);
router.post('/:id/bookmark', authenticate, authorize('STUDENT', 'MENTOR'), toggleBookmark);
router.post('/:id/complete', authenticate, authorize('STUDENT'), markComplete);

// Individual resource
router.get('/:id', getResource);

// Mentor/Admin — create & update
router.post('/', authenticate, authorize('MENTOR', 'ADMIN'), createResource);
router.put('/:id', authenticate, authorize('MENTOR', 'ADMIN'), updateResource);

// Admin — delete
router.delete('/:id', authenticate, authorize('ADMIN'), deleteResource);

module.exports = router;
