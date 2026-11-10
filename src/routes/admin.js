'use strict';

const router = require('express').Router();
const { getStats, getUsers, toggleUser, deleteUser } = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  getResources, createResource, updateResource, deleteResource,
} = require('../controllers/resourceController');
const { getQuizzes, createQuiz, deleteQuiz } = require('../controllers/quizController');
const {
  createScheme, updateScheme, deleteScheme,
  createJob, updateJob, deleteJob,
} = require('../controllers/opportunityController');

router.use(authenticate, authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

// Resource management
router.get('/resources', getResources);
router.post('/resources', createResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

// Quiz management
router.get('/quizzes', getQuizzes);
router.post('/quizzes', createQuiz);
router.delete('/quizzes/:id', deleteQuiz);

// Opportunities
router.post('/schemes', createScheme);
router.put('/schemes/:id', updateScheme);
router.delete('/schemes/:id', deleteScheme);
router.post('/jobs', createJob);
router.put('/jobs/:id', updateJob);
router.delete('/jobs/:id', deleteJob);

module.exports = router;

