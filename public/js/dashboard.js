// RuralConnect - Student Dashboard Controller

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('STUDENT');
  if (!user) return;

  // Populate basic user info
  document.getElementById('sidebar-name').innerText = user.name;
  document.getElementById('sidebar-avatar').innerText = user.name.charAt(0).toUpperCase();

  await loadDashboardData();
  await loadRecommendedResources();
  await loadScholarshipsPreview();
});

async function loadDashboardData() {
  try {
    const res = await api.get('/students/dashboard');
    if (!res.success) return;

    const { user, stats, recentAttempts, recentActivities } = res.data;

    // Welcome title
    const welcomeMsg = document.getElementById('welcome-msg');
    const welcomeSub = document.getElementById('welcome-sub');
    welcomeMsg.innerText = `Welcome back, ${user.name}!`;

    const village = user.profile?.village || 'your village';
    const standard = user.profile?.class ? `Class ${user.profile.class}` : 'Student';
    welcomeSub.innerText = `${standard} • ${village} | Keep progressing on your learning goals today.`;

    // Stats
    document.getElementById('stat-completed').innerText = stats.completedResources || 0;
    document.getElementById('stat-bookmarks').innerText = stats.bookmarks || 0;
    document.getElementById('stat-quizzes').innerText = stats.quizzesTaken || 0;
    document.getElementById('stat-avg-score').innerText = `${stats.averageScore || 0}%`;

    // Activity feed
    renderActivities(recentActivities);

    // Recent attempts
    renderRecentAttempts(recentAttempts);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderActivities(activities) {
  const list = document.getElementById('activity-feed');
  if (!activities || activities.length === 0) {
    list.innerHTML = '<li class="empty-state" style="padding: 1.5rem 0;">No activities logged yet.</li>';
    return;
  }

  list.innerHTML = activities.slice(0, 6).map(act => `
    <li class="activity-item">
      <div class="activity-dot"></div>
      <div>
        <div class="activity-desc">${escapeHtml(act.description)}</div>
        <div class="activity-time">${formatDate(act.createdAt)}</div>
      </div>
    </li>
  `).join('');
}

function renderRecentAttempts(attempts) {
  const container = document.getElementById('recent-quiz-attempts');
  if (!attempts || attempts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 0;">
        <p>No quizzes taken yet.</p>
        <a href="/quizzes" class="btn btn-outline btn-sm" style="margin-top: 0.5rem;">Take a Quiz</a>
      </div>
    `;
    return;
  }

  container.innerHTML = attempts.map(att => `
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--borders);">
      <div>
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--deep-navy);">${escapeHtml(att.quiz?.title || 'Quiz')}</div>
        <div style="font-size: 0.8rem; color: var(--secondary-text);">${escapeHtml(att.quiz?.subject || '')} • ${formatDate(att.submittedAt)}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge ${att.percentage >= 60 ? 'badge-green' : 'badge-warning'}">
          ${att.score} / ${att.totalMarks} (${att.percentage}%)
        </span>
      </div>
    </div>
  `).join('');
}

async function loadRecommendedResources() {
  const container = document.getElementById('recommended-resources-list');
  try {
    const res = await api.get('/resources', { limit: 4 });
    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No resources available yet.</div>';
      return;
    }

    container.innerHTML = res.data.map(item => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; background: #F8FAFC; border-radius: var(--radius-sm); border: 1px solid var(--borders);">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="font-size: 1.3rem;">${item.type === 'VIDEO' ? '🎥' : item.type === 'PDF' ? '📄' : '📖'}</div>
          <div>
            <a href="${item.url}" target="_blank" rel="noopener noreferrer" style="font-weight: 600; font-size: 0.95rem; color: var(--deep-navy);">
              ${escapeHtml(item.title)}
            </a>
            <div style="font-size: 0.8rem; color: var(--secondary-text);">
              ${escapeHtml(item.subject)} • <span class="badge badge-secondary">${item.difficulty}</span>
            </div>
          </div>
        </div>
        <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">Study</a>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state">Failed to load recommendations.</div>';
  }
}

async function loadScholarshipsPreview() {
  const container = document.getElementById('dashboard-scholarships');
  try {
    const res = await api.get('/opportunities/schemes', { limit: 3 });
    if (!res.data || res.data.length === 0) {
      container.innerHTML = '<div class="empty-state">No active schemes found.</div>';
      return;
    }

    container.innerHTML = res.data.map(scheme => `
      <div style="padding: 0.85rem 0; border-bottom: 1px solid var(--borders);">
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--deep-navy); margin-bottom: 0.2rem;">
          ${escapeHtml(scheme.title)}
        </div>
        <div style="font-size: 0.825rem; color: var(--secondary-text); margin-bottom: 0.4rem;">
          ${escapeHtml(scheme.benefits || 'Financial assistance & support')}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="badge badge-blue">${scheme.amount || 'Free Benefit'}</span>
          <a href="${scheme.applicationUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm" style="font-size: 0.8rem;">
            Official Portal ↗
          </a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state">Failed to load scholarships.</div>';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
