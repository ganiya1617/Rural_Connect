'use strict';

const router = require('express').Router();
const { sendRequest, getMyRequests, getIncomingRequests, respondToRequest } = require('../controllers/mentorshipController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/request', authenticate, authorize('STUDENT'), sendRequest);
router.get('/my-requests', authenticate, authorize('STUDENT'), getMyRequests);
router.get('/incoming', authenticate, authorize('MENTOR'), getIncomingRequests);
router.patch('/:id/respond', authenticate, authorize('MENTOR'), respondToRequest);

module.exports = router;

