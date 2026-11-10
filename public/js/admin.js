// RuralConnect - Admin Console Controller

let currentSubTab = 'resources';

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth('ADMIN');
  if (!user) return;

  await loadAdminStats();
  setupAdminListeners();
});

function switchAdminTab(tabName) {
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.sidebar-nav a[href="#tab-${tabName}"]`);
  if (activeLink) activeLink.classList.add('active');

  document.getElementById('admin-view-stats').style.display = tabName === 'stats' ? 'block' : 'none';
  document.getElementById('admin-view-users').style.display = tabName === 'users' ? 'block' : 'none';
  document.getElementById('admin-view-content').style.display = tabName === 'content' ? 'block' : 'none';
  document.getElementById('admin-view-audit').style.display = tabName === 'audit' ? 'block' : 'none';

  if (tabName === 'stats') loadAdminStats();
  if (tabName === 'users') loadAdminUsers();
  if (tabName === 'content') loadAdminContent();
  if (tabName === 'audit') loadAdminAudit();
}

async function loadAdminStats() {
  try {
    const res = await api.get('/admin/stats');
    if (!res.success) throw new Error(res.message);

    const s = res.data.stats;
    document.getElementById('admin-stat-students').innerText = s.students;
    document.getElementById('admin-stat-mentors').innerText = s.mentors;
    document.getElementById('admin-stat-resources').innerText = s.resources;
    document.getElementById('admin-stat-schemes').innerText = s.schemes;
    document.getElementById('admin-stat-jobs').innerText = s.jobs;
    document.getElementById('admin-stat-quizzes').innerText = s.quizzes;
    document.getElementById('admin-stat-attempts').innerText = s.quizAttempts;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminUsers() {
  const container = document.getElementById('admin-users-table-container');
  const search = document.getElementById('admin-user-search').value.trim();
  const role = document.getElementById('admin-role-filter').value;

  try {
    container.innerHTML = '<div class="loading-spinner"></div>';
    const params = {};
    if (search) params.search = search;
    if (role) params.role = role;

    const res = await api.get('/admin/users', params);
    if (!res.success) throw new Error(res.message);

    const users = res.data;
    if (!users || users.length === 0) {
      container.innerHTML = '<div class="empty-state">No users match your criteria.</div>';
      return;
    }

    container.innerHTML = `
      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Registered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr>
                <td style="font-weight: 600; color: var(--deep-navy);">${escapeHtml(u.name)}</td>
                <td>${escapeHtml(u.email)}</td>
                <td><span class="badge ${u.role === 'ADMIN' ? 'badge-danger' : u.role === 'MENTOR' ? 'badge-green' : 'badge-blue'}">${u.role}</span></td>
                <td>
                  <span class="badge ${u.isActive ? 'badge-green' : 'badge-danger'}">
                    ${u.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td>${formatDate(u.createdAt)}</td>
                <td>
                  <div style="display: flex; gap: 0.4rem;">
                    <button class="btn btn-outline btn-sm" onclick="toggleUserStatus('${u.id}')">
                      ${u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button class="btn btn-danger-outline btn-sm" onclick="deleteUserAccount('${u.id}', '${escapeHtml(u.name)}')">
                      Delete
                    </button>
                  </div>
                </td>
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

async function toggleUserStatus(userId) {
  try {
    const res = await api.patch(`/admin/users/${userId}/toggle`);
    showToast(res.message, 'success');
    loadAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUserAccount(userId, userName) {
  if (!confirm(`Are you sure you want to permanently delete account: ${userName}?`)) return;

  try {
    const res = await api.delete(`/admin/users/${userId}`);
    showToast(res.message, 'success');
    loadAdminUsers();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ─── Content Sub-tabs & CRUD ───────────────────────────────────────────────

function switchContentSubTab(tab) {
  currentSubTab = tab;
  ['res', 'sch', 'job', 'qiz'].forEach(t => {
    document.getElementById(`subtab-${t}-btn`).classList.replace('btn-primary', 'btn-outline');
  });

  const btnMap = { resources: 'res', schemes: 'sch', jobs: 'job', quizzes: 'qiz' };
  document.getElementById(`subtab-${btnMap[tab]}-btn`).classList.replace('btn-outline', 'btn-primary');
  loadAdminContent();
}

async function loadAdminContent() {
  const wrapper = document.getElementById('admin-content-table-wrapper');
  wrapper.innerHTML = '<div class="loading-spinner"></div>';

  try {
    if (currentSubTab === 'resources') {
      const res = await api.get('/admin/resources', { limit: 50 });
      renderAdminResourcesTable(res.data);
    } else if (currentSubTab === 'schemes') {
      const res = await api.get('/opportunities/schemes', { limit: 50 });
      renderAdminSchemesTable(res.data);
    } else if (currentSubTab === 'jobs') {
      const res = await api.get('/opportunities/jobs', { limit: 50 });
      renderAdminJobsTable(res.data);
    } else if (currentSubTab === 'quizzes') {
      const res = await api.get('/admin/quizzes');
      renderAdminQuizzesTable(res.data);
    }
  } catch (err) {
    wrapper.innerHTML = `<div class="empty-state"><p>${err.message}</p></div>`;
  }
}

function renderAdminResourcesTable(items) {
  const wrapper = document.getElementById('admin-content-table-wrapper');
  if (!items || items.length === 0) {
    wrapper.innerHTML = '<div class="empty-state">No resources currently listed.</div>';
    return;
  }

  wrapper.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Subject</th>
            <th>Format</th>
            <th>Views</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(r => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(r.title)}</td>
              <td>${escapeHtml(r.subject)}</td>
              <td><span class="badge badge-secondary">${r.type}</span></td>
              <td>${r.viewCount}</td>
              <td>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteResource('${r.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteResource(id) {
  if (!confirm('Are you sure you want to delete this resource?')) return;
  try {
    const res = await api.delete(`/admin/resources/${id}`);
    showToast(res.message, 'success');
    loadAdminContent();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderAdminSchemesTable(items) {
  const wrapper = document.getElementById('admin-content-table-wrapper');
  if (!items || items.length === 0) {
    wrapper.innerHTML = '<div class="empty-state">No schemes currently listed.</div>';
    return;
  }

  wrapper.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Scheme Title</th>
            <th>Type</th>
            <th>Grant / Benefit</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(s => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(s.title)}</td>
              <td><span class="badge badge-blue">${s.type}</span></td>
              <td>${escapeHtml(s.amount || s.benefits || 'N/A')}</td>
              <td>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteScheme('${s.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteScheme(id) {
  if (!confirm('Are you sure you want to delete this scheme?')) return;
  try {
    const res = await api.delete(`/admin/schemes/${id}`);
    showToast(res.message, 'success');
    loadAdminContent();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderAdminJobsTable(items) {
  const wrapper = document.getElementById('admin-content-table-wrapper');
  if (!items || items.length === 0) {
    wrapper.innerHTML = '<div class="empty-state">No jobs listed.</div>';
    return;
  }

  wrapper.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Role Title</th>
            <th>Organization</th>
            <th>Type</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(j => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(j.title)}</td>
              <td>${escapeHtml(j.organization)}</td>
              <td><span class="badge badge-green">${j.type}</span></td>
              <td>${escapeHtml(j.location)}</td>
              <td>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteJob('${j.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteJob(id) {
  if (!confirm('Are you sure you want to delete this job posting?')) return;
  try {
    const res = await api.delete(`/admin/jobs/${id}`);
    showToast(res.message, 'success');
    loadAdminContent();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderAdminQuizzesTable(items) {
  const wrapper = document.getElementById('admin-content-table-wrapper');
  if (!items || items.length === 0) {
    wrapper.innerHTML = '<div class="empty-state">No quizzes found.</div>';
    return;
  }

  wrapper.innerHTML = `
    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Quiz Title</th>
            <th>Subject</th>
            <th>Duration</th>
            <th>Total Marks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(q => `
            <tr>
              <td style="font-weight: 600;">${escapeHtml(q.title)}</td>
              <td>${escapeHtml(q.subject)}</td>
              <td>${q.duration} Mins</td>
              <td>${q.totalMarks} Marks</td>
              <td>
                <button class="btn btn-danger-outline btn-sm" onclick="deleteQuiz('${q.id}')">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function deleteQuiz(id) {
  if (!confirm('Are you sure you want to delete this quiz?')) return;
  try {
    const res = await api.delete(`/admin/quizzes/${id}`);
    showToast(res.message, 'success');
    loadAdminContent();
    loadAdminStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function loadAdminAudit() {
  const list = document.getElementById('admin-activity-feed');
  try {
    list.innerHTML = '<li class="loading-spinner"></li>';
    const res = await api.get('/admin/stats');
    const activities = res.data.recentActivities || [];

    if (activities.length === 0) {
      list.innerHTML = '<li class="empty-state">No activities recorded.</li>';
      return;
    }

    list.innerHTML = activities.map(act => `
      <li class="activity-item">
        <div class="activity-dot"></div>
        <div style="flex: 1;">
          <div style="display: flex; justify-content: space-between;">
            <span class="activity-desc">${escapeHtml(act.description)}</span>
            <span class="badge badge-secondary">${act.type}</span>
          </div>
          <div class="activity-time">${formatDate(act.createdAt)}</div>
        </div>
      </li>
    `).join('');
  } catch (err) {
    list.innerHTML = `<li class="empty-state">${err.message}</li>`;
  }
}

function setupAdminListeners() {
  const userSearch = document.getElementById('admin-user-search');
  const roleFilter = document.getElementById('admin-role-filter');

  let debounceTimer;
  userSearch.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadAdminUsers(), 300);
  });
  roleFilter.addEventListener('change', () => loadAdminUsers());

  // Add Resource
  document.getElementById('admin-add-resource-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: document.getElementById('adm-res-title').value.trim(),
        subject: document.getElementById('adm-res-subject').value.trim(),
        type: document.getElementById('adm-res-type').value,
        url: document.getElementById('adm-res-url').value.trim(),
        description: document.getElementById('adm-res-desc').value.trim(),
      };
      await api.post('/admin/resources', body);
      showToast('Resource created!', 'success');
      closeModal('create-resource-modal');
      e.target.reset();
      loadAdminContent();
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Add Scheme
  document.getElementById('admin-add-scheme-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: document.getElementById('adm-sch-title').value.trim(),
        type: document.getElementById('adm-sch-type').value,
        amount: document.getElementById('adm-sch-amount').value.trim(),
        eligibility: document.getElementById('adm-sch-eligibility').value.trim(),
        benefits: document.getElementById('adm-sch-benefits').value.trim(),
        applicationUrl: document.getElementById('adm-sch-url').value.trim(),
        description: document.getElementById('adm-sch-desc').value.trim(),
      };
      await api.post('/admin/schemes', body);
      showToast('Scheme created!', 'success');
      closeModal('create-scheme-modal');
      e.target.reset();
      loadAdminContent();
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Add Job
  document.getElementById('admin-add-job-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: document.getElementById('adm-job-title').value.trim(),
        organization: document.getElementById('adm-job-org').value.trim(),
        type: document.getElementById('adm-job-type').value,
        location: document.getElementById('adm-job-loc').value.trim(),
        salary: document.getElementById('adm-job-salary').value.trim(),
        eligibility: document.getElementById('adm-job-eligibility').value.trim(),
        applicationUrl: document.getElementById('adm-job-url').value.trim(),
        description: document.getElementById('adm-job-desc').value.trim(),
      };
      await api.post('/admin/jobs', body);
      showToast('Job posted!', 'success');
      closeModal('create-job-modal');
      e.target.reset();
      loadAdminContent();
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Add Quiz
  document.getElementById('admin-add-quiz-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = {
        title: document.getElementById('adm-quiz-title').value.trim(),
        subject: document.getElementById('adm-quiz-subject').value.trim(),
        duration: parseInt(document.getElementById('adm-quiz-duration').value) || 20,
        description: document.getElementById('adm-quiz-desc').value.trim(),
      };
      await api.post('/admin/quizzes', body);
      showToast('Quiz created!', 'success');
      closeModal('create-quiz-modal');
      e.target.reset();
      loadAdminContent();
      loadAdminStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

