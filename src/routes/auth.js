'use strict';

const router = require('express').Router();
const { registerStudent, registerMentor, login, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  validate, registerStudentRules, registerMentorRules,
  loginRules, updatePasswordRules,
} = require('../middleware/validation');

router.post('/register/student', registerStudentRules, validate, registerStudent);
router.post('/register/mentor', registerMentorRules, validate, registerMentor);
router.post('/login', loginRules, validate, login);
router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, updatePasswordRules, validate, changePassword);

module.exports = router;

