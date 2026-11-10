'use strict';

const { getPrismaClient } = require('../db');

// GET /api/quizzes
async function getQuizzes(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { subject } = req.query;
    const quizzes = await prisma.quiz.findMany({
      where: { isPublished: true, ...(subject && { subject }) },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: quizzes });
  } catch (err) {
    next(err);
  }
}

// GET /api/quizzes/:id
async function getQuiz(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    // Strip correct answers for active quiz taking
    const sanitized = {
      ...quiz,
      questions: quiz.questions.map(({ correctOption, explanation, ...q }) => q),
    };
    res.json({ success: true, data: sanitized });
  } catch (err) {
    next(err);
  }
}

// POST /api/quizzes/:id/submit
async function submitQuiz(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { answers, timeTaken } = req.body;

    const quiz = await prisma.quiz.findUnique({
      where: { id: req.params.id },
      include: { questions: { orderBy: { order: 'asc' } } },
    });
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    // Calculate score
    let score = 0;
    const results = quiz.questions.map(q => {
      const given = answers[q.id];
      const correct = given === q.correctOption;
      if (correct) score += q.marks;
      return {
        questionId: q.id,
        questionText: q.questionText,
        givenAnswer: given,
        correctAnswer: q.correctOption,
        correct,
        explanation: q.explanation,
      };
    });

    const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: req.user.id,
        quizId: quiz.id,
        answers,
        score,
        totalMarks: quiz.totalMarks,
        percentage,
        timeTaken: parseInt(timeTaken) || 0,
      },
    });

    await prisma.activity.create({
      data: {
        userId: req.user.id,
        type: 'QUIZ_ATTEMPT',
        description: `Completed quiz: ${quiz.title} — Score: ${score}/${quiz.totalMarks}`,
        metadata: { quizId: quiz.id, score, percentage },
      },
    });

    res.json({
      success: true,
      message: 'Quiz submitted!',
      data: { attempt, results, score, totalMarks: quiz.totalMarks, percentage },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/quizzes/my-attempts
async function getMyAttempts(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId: req.user.id },
      include: { quiz: { select: { title: true, subject: true, topic: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ success: true, data: attempts });
  } catch (err) {
    next(err);
  }
}

// Admin: POST /api/quizzes
async function createQuiz(req, res, next) {
  try {
    const prisma = getPrismaClient();
    const { title, description, subject, topic, duration, totalMarks, questions } = req.body;
    const quiz = await prisma.quiz.create({
      data: {
        title, description, subject, topic,
        duration: parseInt(duration) || 30,
        totalMarks: parseInt(totalMarks) || 10,
        questions: { create: questions || [] },
      },
      include: { questions: true },
    });
    res.status(201).json({ success: true, data: quiz });
  } catch (err) {
    next(err);
  }
}

// Admin: DELETE /api/quizzes/:id
async function deleteQuiz(req, res, next) {
  try {
    const prisma = getPrismaClient();
    await prisma.quiz.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Quiz deleted.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getQuizzes, getQuiz, submitQuiz, getMyAttempts, createQuiz, deleteQuiz };

