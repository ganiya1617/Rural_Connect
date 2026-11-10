// RuralConnect - Mentor Connect Controller

let sentRequestsMap = new Map(); // mentorId -> request object

document.addEventListener('DOMContentLoaded', async () => {
  setupMentorListeners();
  await loadMyRequests();
  await fetchMentors();
});

function setupMentorListeners() {
  const searchInput = document.getElementById('mentor-search');
  const subjectFilter = document.getElementById('mentor-subject-filter');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchMentors(), 300);
  });

  subjectFilter.addEventListener('change', () => fetchMentors());
}

async function loadMyRequests() {
  const user = api.getUser();
  if (!user || user.role !== 'STUDENT') return;

  const reqContainer = document.getElementById('student-requests-container');
  reqContainer.style.display = 'block';

  try {
    const res = await api.get('/mentorship/my-requests');
    if (res.success && res.data) {
      res.data.forEach(req => {
        sentRequestsMap.set(req.mentorId, req);
      });
      renderSentRequests(res.data);
    }
  } catch (err) {
    console.error('Failed to load my requests:', err);
  }
}

function renderSentRequests(requests) {
  const list = document.getElementById('student-requests-list');
  if (!requests || requests.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding: 1.5rem 0;">You have not sent any mentorship requests yet.</div>';
    return;
  }

  list.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Mentor Name</th>
            <th>Organization</th>
            <th>Status</th>
            <th>Sent On</th>
          </tr>
        </thead>
        <tbody>
          ${requests.map(r => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(r.mentor?.name || 'Mentor')}</td>
              <td>${escapeHtml(r.mentor?.mentorProfile?.organization || 'N/A')}</td>
              <td>
                <span class="badge ${r.status === 'ACCEPTED' ? 'badge-green' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">
                  ${r.status}
                </span>
              </td>
              <td>${formatDate(r.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function fetchMentors() {
  const grid = document.getElementById('mentors-grid');
  const search = document.getElementById('mentor-search').value.trim();
  const subject = document.getElementById('mentor-subject-filter').value;

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';

    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;

    const res = await api.get('/mentors', params);
    if (!res.success) throw new Error(res.message);

    renderMentors(res.data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

function renderMentors(mentors) {
  const grid = document.getElementById('mentors-grid');
  if (!mentors || mentors.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👨‍🏫</div>
        <h3>No mentors found</h3>
        <p>Try broadening your search or choosing a different subject.</p>
      </div>
    `;
    return;
  }

  const user = api.getUser();

  grid.innerHTML = mentors.map(m => {
    const p = m.mentorProfile || {};
    const sentReq = sentRequestsMap.get(m.id);

    return `
      <div class="card mentor-card">
        <div>
          <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
            <div class="user-avatar-placeholder" style="width: 50px; height: 50px; font-size: 1.3rem;">
              ${m.name.charAt(0)}
            </div>
            <div>
              <h3 style="font-size: 1.15rem; color: var(--deep-navy); margin-bottom: 0.2rem;">${escapeHtml(m.name)}</h3>
              <div style="font-size: 0.85rem; color: var(--secondary-text);">
                ${escapeHtml(p.designation || 'Educator')} • ${escapeHtml(p.organization || '')}
              </div>
            </div>
          </div>

          <p class="resource-desc" style="margin-bottom: 1rem;">
            ${escapeHtml(p.bio || 'Experienced educator enthusiastic about helping students from rural backgrounds.')}
          </p>

          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--secondary-text); margin-bottom: 0.3rem;">EXPERTISE:</div>
            <div class="tag-list">
              ${(p.expertise || []).map(exp => `<span class="tag-pill">${escapeHtml(exp)}</span>`).join('')}
            </div>
          </div>
        </div>

        <div>
          <div style="font-size: 0.82rem; color: var(--secondary-text); margin-bottom: 0.75rem;">
            📍 ${escapeHtml(p.location || 'India')} • Experience: <strong>${p.experience || 0} years</strong>
          </div>

          <div class="card-actions">
            ${user && user.role === 'STUDENT' ? `
              ${sentReq ? `
                <span class="badge ${sentReq.status === 'ACCEPTED' ? 'badge-green' : sentReq.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'}">
                  Request ${sentReq.status}
                </span>
              ` : `
                <button class="btn btn-primary btn-sm" onclick="openRequestModal('${m.id}', '${escapeHtml(m.name)}')">
                  Connect & Request Mentorship
                </button>
              `}
            ` : user && user.role === 'MENTOR' ? `
              <span class="badge badge-secondary">Fellow Mentor</span>
            ` : `
              <a href="/login" class="btn btn-outline btn-sm">Login to Connect</a>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openRequestModal(mentorId, mentorName) {
  document.getElementById('modal-mentor-id').value = mentorId;
  document.getElementById('modal-mentor-name').innerText = `Request Mentorship from ${mentorName}`;
  document.getElementById('request-message').value = '';
  openModal('request-modal');
}

async function submitMentorshipRequest() {
  const mentorId = document.getElementById('modal-mentor-id').value;
  const message = document.getElementById('request-message').value.trim();
  const btn = document.getElementById('send-request-submit-btn');

  if (!mentorId) return;

  try {
    btn.disabled = true;
    btn.innerText = 'Sending...';

    const res = await api.post('/mentorship/request', { mentorId, message });
    showToast(res.message, 'success');
    closeModal('request-modal');

    sentRequestsMap.set(mentorId, res.data);
    await loadMyRequests();
    fetchMentors();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerText = 'Send Request';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

