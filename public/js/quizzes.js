// RuralConnect - Quiz Runner Controller

let activeQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = {}; // questionId -> selectedOption ('A', 'B', 'C', 'D')
let quizTimerInterval = null;
let secondsRemaining = 0;

document.addEventListener('DOMContentLoaded', async () => {
  await fetchQuizzes();
  await fetchMyAttempts();
});

async function fetchQuizzes() {
  const grid = document.getElementById('quizzes-grid');
  try {
    const res = await api.get('/quizzes');
    if (!res.success) throw new Error(res.message);

    if (!res.data || res.data.length === 0) {
      grid.innerHTML = '<div class="empty-state" style="grid-column: 1 / -1;"><p>No quizzes available right now.</p></div>';
      return;
    }

    grid.innerHTML = res.data.map(q => `
      <div class="card resource-card">
        <div>
          <div class="resource-card-header">
            <span class="badge badge-blue">📝 ${escapeHtml(q.subject)}</span>
            <span class="badge badge-secondary">${q.duration} Mins</span>
          </div>
          <h3 class="resource-title">${escapeHtml(q.title)}</h3>
          <p class="resource-desc">${escapeHtml(q.description || 'Test your understanding with this subject quiz.')}</p>
        </div>

        <div>
          <div style="font-size: 0.85rem; color: var(--secondary-text); margin-bottom: 1rem;">
            Questions: <strong>${q._count?.questions || 0}</strong> • Total Marks: <strong>${q.totalMarks}</strong>
          </div>
          <div class="card-actions">
            <button class="btn btn-primary btn-sm" onclick="startQuiz('${q.id}')">Start Quiz Now →</button>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

async function fetchMyAttempts() {
  const container = document.getElementById('quiz-history-container');
  const user = api.getUser();

  if (!user || user.role !== 'STUDENT') {
    container.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">Sign in as a student to view quiz history.</div>';
    return;
  }

  try {
    const res = await api.get('/quizzes/my-attempts');
    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">No attempts recorded yet. Take your first quiz above!</div>';
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Quiz Title</th>
              <th>Subject</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Attempted Date</th>
            </tr>
          </thead>
          <tbody>
            ${res.data.map(att => `
              <tr>
                <td style="font-weight: 600;">${escapeHtml(att.quiz?.title || 'Quiz')}</td>
                <td>${escapeHtml(att.quiz?.subject || 'N/A')}</td>
                <td><strong>${att.score} / ${att.totalMarks}</strong></td>
                <td>
                  <span class="badge ${att.percentage >= 60 ? 'badge-green' : 'badge-warning'}">
                    ${att.percentage}%
                  </span>
                </td>
                <td>${formatDate(att.submittedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

async function startQuiz(quizId) {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to take quizzes', 'info');
    setTimeout(() => window.location.href = '/login', 1000);
    return;
  }

  try {
    const res = await api.get(`/quizzes/${quizId}`);
    if (!res.success) throw new Error(res.message);

    activeQuiz = res.data;
    if (!activeQuiz.questions || activeQuiz.questions.length === 0) {
      showToast('This quiz does not have any questions yet.', 'info');
      return;
    }

    currentQuestionIndex = 0;
    userAnswers = {};

    // Switch views
    document.getElementById('quiz-list-section').style.display = 'none';
    document.getElementById('quiz-results-section').style.display = 'none';
    document.getElementById('quiz-runner-section').style.display = 'block';

    // Populate Header
    document.getElementById('active-quiz-title').innerText = activeQuiz.title;
    document.getElementById('active-quiz-subject').innerText = activeQuiz.subject;
    document.getElementById('total-questions-count').innerText = activeQuiz.questions.length;

    // Start Timer
    secondsRemaining = (activeQuiz.duration || 30) * 60;
    startTimer();

    // Render First Question
    renderCurrentQuestion();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function startTimer() {
  clearInterval(quizTimerInterval);
  updateTimerDisplay();

  quizTimerInterval = setInterval(() => {
    secondsRemaining--;
    updateTimerDisplay();

    if (secondsRemaining <= 0) {
      clearInterval(quizTimerInterval);
      showToast('Time is up! Submitting quiz...', 'warning');
      submitCurrentQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  document.getElementById('timer-display').innerText =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function renderCurrentQuestion() {
  const q = activeQuiz.questions[currentQuestionIndex];
  document.getElementById('current-question-idx').innerText = currentQuestionIndex + 1;
  document.getElementById('question-text').innerText = `${currentQuestionIndex + 1}. ${q.questionText}`;

  const optionsContainer = document.getElementById('options-container');
  const selected = userAnswers[q.id];

  const options = [
    { key: 'A', text: q.optionA },
    { key: 'B', text: q.optionB },
    { key: 'C', text: q.optionC },
    { key: 'D', text: q.optionD },
  ];

  optionsContainer.innerHTML = options.map(opt => `
    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.85rem 1rem; border: 1px solid ${selected === opt.key ? 'var(--primary-blue)' : 'var(--borders)'}; background: ${selected === opt.key ? '#EFF6FF' : '#ffffff'}; border-radius: var(--radius-sm); cursor: pointer; transition: var(--transition);">
      <input type="radio" name="quiz_opt_${q.id}" value="${opt.key}" ${selected === opt.key ? 'checked' : ''} onchange="selectAnswer('${q.id}', '${opt.key}')">
      <span style="font-weight: 600; color: var(--deep-navy);">${opt.key}.</span>
      <span style="color: var(--main-text); font-size: 0.95rem;">${escapeHtml(opt.text)}</span>
    </label>
  `).join('');

  // Buttons states
  document.getElementById('prev-question-btn').disabled = currentQuestionIndex === 0;

  const isLast = currentQuestionIndex === activeQuiz.questions.length - 1;
  document.getElementById('next-question-btn').style.display = isLast ? 'none' : 'inline-flex';
  document.getElementById('submit-quiz-btn').style.display = isLast ? 'inline-flex' : 'none';
}

function selectAnswer(questionId, optionKey) {
  userAnswers[questionId] = optionKey;
  renderCurrentQuestion();
}

function nextQuestion() {
  if (currentQuestionIndex < activeQuiz.questions.length - 1) {
    currentQuestionIndex++;
    renderCurrentQuestion();
  }
}

function prevQuestion() {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderCurrentQuestion();
  }
}

async function submitCurrentQuiz() {
  clearInterval(quizTimerInterval);

  const totalTimeTaken = ((activeQuiz.duration || 30) * 60) - secondsRemaining;

  try {
    const res = await api.post(`/quizzes/${activeQuiz.id}/submit`, {
      answers: userAnswers,
      timeTaken: totalTimeTaken,
    });

    if (!res.success) throw new Error(res.message);

    showResults(res.data);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function showResults(data) {
  document.getElementById('quiz-runner-section').style.display = 'none';
  document.getElementById('quiz-results-section').style.display = 'block';

  document.getElementById('result-score').innerText = `${data.score} / ${data.totalMarks}`;
  document.getElementById('result-percentage').innerText = `${data.percentage}%`;

  const breakdownContainer = document.getElementById('solution-breakdown-container');
  breakdownContainer.innerHTML = data.results.map((r, i) => `
    <div style="padding: 1.25rem 0; border-bottom: 1px solid var(--borders);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.5rem;">
        <span style="font-weight: 600; color: var(--deep-navy);">Q${i + 1}. ${escapeHtml(r.questionText)}</span>
        <span class="badge ${r.correct ? 'badge-green' : 'badge-danger'}">
          ${r.correct ? '✓ Correct (+1)' : '✗ Incorrect (0)'}
        </span>
      </div>

      <div style="font-size: 0.88rem; margin-bottom: 0.4rem;">
        Your answer: <strong style="color: ${r.correct ? 'var(--accent-green)' : 'var(--danger)'};">${r.givenAnswer || 'Not answered'}</strong>
        ${!r.correct ? ` • Correct answer: <strong style="color: var(--accent-green);">${r.correctAnswer}</strong>` : ''}
      </div>

      ${r.explanation ? `
        <div style="font-size: 0.85rem; background: #F8FAFC; padding: 0.6rem 0.8rem; border-radius: var(--radius-sm); color: var(--secondary-text); border-left: 3px solid var(--primary-blue);">
          💡 <strong>Explanation:</strong> ${escapeHtml(r.explanation)}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function exitQuiz() {
  clearInterval(quizTimerInterval);
  document.getElementById('quiz-runner-section').style.display = 'none';
  document.getElementById('quiz-results-section').style.display = 'none';
  document.getElementById('quiz-list-section').style.display = 'block';
  fetchMyAttempts();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

