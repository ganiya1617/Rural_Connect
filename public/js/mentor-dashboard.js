// RuralConnect - Mentor Dashboard Controller

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('MENTOR');
  if (!user) return;

  document.getElementById('mentor-sidebar-name').innerText = user.name;
  document.getElementById('mentor-sidebar-avatar').innerText = user.name.charAt(0);
  document.getElementById('mentor-welcome').innerText = `Welcome, ${user.name}!`;

  await loadMentorDashboard();
  setupUploadResourceForm();
});

async function loadMentorDashboard() {
  try {
    const res = await api.get('/mentors/me/dashboard');
    if (!res.success) throw new Error(res.message);

    const { stats, pendingRequests, connectedStudents, recentResources } = res.data;

    // Stats
    document.getElementById('stat-pending-reqs').innerText = stats.pendingRequests;
    document.getElementById('stat-connected-students').innerText = stats.connectedStudents;
    document.getElementById('stat-uploaded-resources').innerText = stats.resourcesUploaded;
    document.getElementById('pending-badge').innerText = `${stats.pendingRequests} Pending`;

    // Render lists
    renderIncomingRequests(pendingRequests);
    renderConnectedStudents(connectedStudents);
    renderMentorResources(recentResources);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderIncomingRequests(requests) {
  const container = document.getElementById('incoming-requests-list');
  if (!requests || requests.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">No pending mentorship requests.</div>';
    return;
  }

  container.innerHTML = requests.map(req => {
    const student = req.student || {};
    const profile = student.studentProfile || {};

    return `
      <div style="padding: 1.25rem; border: 1px solid var(--borders); border-radius: var(--radius-sm); margin-bottom: 1rem; background: #F8FAFC;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h4 style="font-size: 1.1rem; color: var(--deep-navy);">${escapeHtml(student.name)}</h4>
            <div style="font-size: 0.85rem; color: var(--secondary-text);">
              📍 ${escapeHtml(profile.village || 'Rural Area')}, ${escapeHtml(profile.state || 'India')} • Class: ${escapeHtml(profile.class || 'N/A')}
            </div>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-success btn-sm" onclick="respondRequest('${req.id}', 'ACCEPTED')">Accept Mentee</button>
            <button class="btn btn-danger-outline btn-sm" onclick="respondRequest('${req.id}', 'REJECTED')">Decline</button>
          </div>
        </div>

        <div style="font-size: 0.9rem; color: var(--main-text); background: #ffffff; padding: 0.75rem 1rem; border-radius: var(--radius-sm); border: 1px solid var(--borders); margin-top: 0.5rem;">
          "${escapeHtml(req.message || 'Looking forward to your guidance.')}"
        </div>
      </div>
    `;
  }).join('');
}

function renderConnectedStudents(connections) {
  const container = document.getElementById('connected-students-list');
  if (!connections || connections.length === 0) {
    container.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">No active mentees yet. Accept incoming requests above to start mentoring!</div>';
    return;
  }

  container.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Contact Email</th>
            <th>Village / District</th>
            <th>School / Class</th>
            <th>Connected Since</th>
          </tr>
        </thead>
        <tbody>
          ${connections.map(c => {
            const student = c.student || {};
            const p = student.studentProfile || {};
            return `
              <tr>
                <td style="font-weight: 600; color: var(--deep-navy);">${escapeHtml(student.name)}</td>
                <td><a href="mailto:${student.email}">${escapeHtml(student.email)}</a></td>
                <td>${escapeHtml(p.village || 'N/A')}, ${escapeHtml(p.district || '')}</td>
                <td>${escapeHtml(p.school || 'N/A')} (${escapeHtml(p.class || '')})</td>
                <td>${formatDate(c.updatedAt)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderMentorResources(resources) {
  const container = document.getElementById('mentor-resources-list');
  if (!resources || resources.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 1.5rem 0;">
        <p>You haven't contributed any learning materials yet.</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 0.5rem;" onclick="openModal('upload-resource-modal')">Share Your First Resource</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Type</th>
            <th>Views</th>
            <th>Published</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${resources.map(r => `
            <tr>
              <td style="font-weight: 600; color: var(--deep-navy);">${escapeHtml(r.title)}</td>
              <td>${escapeHtml(r.subject)}</td>
              <td><span class="badge badge-secondary">${r.type}</span></td>
              <td>${r.viewCount}</td>
              <td>${formatDate(r.createdAt)}</td>
              <td>
                <a href="${r.url}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">View ↗</a>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function respondRequest(requestId, status) {
  try {
    const res = await api.patch(`/mentorship/${requestId}/respond`, { status });
    showToast(res.message, 'success');
    await loadMentorDashboard();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupUploadResourceForm() {
  const form = document.getElementById('share-resource-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('publish-res-btn');

    try {
      btn.disabled = true;
      btn.innerText = 'Publishing...';

      const body = {
        title: document.getElementById('res-title').value.trim(),
        subject: document.getElementById('res-subject').value.trim(),
        type: document.getElementById('res-type').value,
        url: document.getElementById('res-url').value.trim(),
        difficulty: document.getElementById('res-difficulty').value,
        tags: document.getElementById('res-tags').value.split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
        description: document.getElementById('res-description').value.trim(),
      };

      const res = await api.post('/resources', body);
      showToast('Resource published successfully!', 'success');
      form.reset();
      closeModal('upload-resource-modal');
      await loadMentorDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Publish Resource';
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

