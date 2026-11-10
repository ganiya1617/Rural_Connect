'use strict';

const router = require('express').Router();
const {
  getResources, getResource, toggleBookmark, markComplete,
  getBookmarks, getSubjects, createResource, updateResource, deleteResource,
} = require('../controllers/resourceController');
const { authenticate, authorize } = require('../middleware/auth');

// Public
router.get('/', getResources);
router.get('/subjects', getSubjects);
router.get('/:id', getResource);

// Student/Mentor
router.post('/:id/bookmark', authenticate, authorize('STUDENT', 'MENTOR'), toggleBookmark);
router.post('/:id/complete', authenticate, authorize('STUDENT'), markComplete);
router.get('/me/bookmarks', authenticate, getBookmarks);

// Mentor/Admin — create
router.post('/', authenticate, authorize('MENTOR', 'ADMIN'), createResource);
router.put('/:id', authenticate, authorize('MENTOR', 'ADMIN'), updateResource);

// Admin — delete
router.delete('/:id', authenticate, authorize('ADMIN'), deleteResource);

module.exports = router;

