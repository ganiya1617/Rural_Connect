'use strict';

const router = require('express').Router();
const { getQuizzes, getQuiz, submitQuiz, getMyAttempts, createQuiz, deleteQuiz } = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', getQuizzes);
router.get('/my-attempts', authenticate, authorize('STUDENT'), getMyAttempts);
router.get('/:id', getQuiz);
router.post('/:id/submit', authenticate, authorize('STUDENT'), submitQuiz);

// Admin
router.post('/', authenticate, authorize('ADMIN'), createQuiz);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteQuiz);

module.exports = router;

