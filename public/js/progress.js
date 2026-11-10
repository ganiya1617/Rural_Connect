// RuralConnect - Student Progress Controller

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('STUDENT');
  if (!user) return;

  await loadProgressData();
});

async function loadProgressData() {
  try {
    const res = await api.get('/students/progress');
    if (!res.success) throw new Error(res.message);

    const { completedResources, totalResources, progressPercentage, quizAttempts, subjectProgress, averageScore } = res.data;

    // Overall Progress
    document.getElementById('overall-percentage').innerText = `${progressPercentage}%`;
    document.getElementById('overall-progress-bar').style.width = `${progressPercentage}%`;
    document.getElementById('progress-summary-text').innerText =
      `${completedResources.length} out of ${totalResources} available portal resources finished.`;

    // Quiz Metrics
    document.getElementById('stat-tests-taken').innerText = quizAttempts.length;
    document.getElementById('stat-mean-score').innerText = `${averageScore}%`;

    // Subject Breakdown
    renderSubjectBreakdown(subjectProgress);

    // Completed Table
    renderCompletedTable(completedResources);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderSubjectBreakdown(subjectProgress) {
  const container = document.getElementById('subject-distribution-container');
  const subjects = Object.keys(subjectProgress || {});

  if (subjects.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">No completed lessons recorded yet.</div>';
    return;
  }

  const maxVal = Math.max(...Object.values(subjectProgress), 1);

  container.innerHTML = subjects.map(sub => {
    const count = subjectProgress[sub];
    const percentage = Math.round((count / maxVal) * 100);

    return `
      <div style="margin-bottom: 1.1rem;">
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.3rem;">
          <span style="font-weight: 500; color: var(--deep-navy);">${escapeHtml(sub)}</span>
          <span style="color: var(--secondary-text);">${count} lesson${count > 1 ? 's' : ''}</span>
        </div>
        <div class="progress-container" style="height: 8px;">
          <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderCompletedTable(completed) {
  const wrapper = document.getElementById('completed-resources-table-wrapper');
  if (!completed || completed.length === 0) {
    wrapper.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 0;">
        <p>You haven't marked any resources as completed yet.</p>
        <a href="/resources" class="btn btn-primary btn-sm" style="margin-top: 0.75rem;">Explore Resources</a>
      </div>
    `;
    return;
  }

  wrapper.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Resource Title</th>
            <th>Subject</th>
            <th>Format</th>
            <th>Completed On</th>
          </tr>
        </thead>
        <tbody>
          ${completed.map(item => `
            <tr>
              <td style="font-weight: 600; color: var(--deep-navy);">
                ${escapeHtml(item.resource?.title || 'Resource')}
              </td>
              <td>${escapeHtml(item.resource?.subject || '')}</td>
              <td><span class="badge badge-secondary">${item.resource?.type || 'ARTICLE'}</span></td>
              <td>${formatDate(item.completedAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

