// RuralConnect - Jobs & Internships Controller

document.addEventListener('DOMContentLoaded', () => {
  setupJobListeners();
  fetchJobs();
});

function setupJobListeners() {
  const searchInput = document.getElementById('job-search');
  const typeFilter = document.getElementById('job-type-filter');
  const locationFilter = document.getElementById('job-location-filter');

  let debounceTimer;
  const triggerDebounced = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchJobs(), 300);
  };

  searchInput.addEventListener('input', triggerDebounced);
  locationFilter.addEventListener('input', triggerDebounced);
  typeFilter.addEventListener('change', () => fetchJobs());
}

async function fetchJobs() {
  const grid = document.getElementById('jobs-grid');
  const search = document.getElementById('job-search').value.trim();
  const type = document.getElementById('job-type-filter').value;
  const location = document.getElementById('job-location-filter').value.trim();

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';

    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;
    if (location) params.location = location;

    const res = await api.get('/opportunities/jobs', params);
    if (!res.success) throw new Error(res.message);

    renderJobs(res.data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

function renderJobs(jobs) {
  const grid = document.getElementById('jobs-grid');
  if (!jobs || jobs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💼</div>
        <h3>No opportunities match your filter</h3>
        <p>Try searching for different keywords or checking back later.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = jobs.map(job => {
    const compensation = job.stipend || job.salary || 'Unpaid / Certificate';
    const typeBadge = job.type === 'INTERNSHIP' ? 'badge-blue' : job.type === 'FULL_TIME' ? 'badge-green' : 'badge-warning';

    return `
      <div class="card opportunity-card">
        <div>
          <div class="resource-card-header">
            <span class="badge ${typeBadge}">💼 ${job.type}</span>
            <span class="badge badge-secondary">📍 ${escapeHtml(job.location)}</span>
          </div>

          <h3 class="opportunity-title">${escapeHtml(job.title)}</h3>
          <div style="font-size: 0.88rem; font-weight: 500; color: var(--deep-navy); margin-bottom: 0.75rem;">
            🏢 ${escapeHtml(job.organization)}
          </div>

          <p class="resource-desc" style="margin-bottom: 1rem;">
            ${escapeHtml(job.description)}
          </p>

          <div style="background: #F8FAFC; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--borders); margin-bottom: 1rem;">
            <div style="font-size: 0.8rem; font-weight: 600; color: var(--secondary-text); margin-bottom: 0.2rem;">STIPEND / SALARY:</div>
            <div style="font-size: 0.95rem; font-weight: 600; color: var(--accent-green);">${escapeHtml(compensation)}</div>

            <div style="font-size: 0.8rem; font-weight: 600; color: var(--secondary-text); margin-top: 0.4rem; margin-bottom: 0.2rem;">ELIGIBILITY:</div>
            <div style="font-size: 0.85rem; color: var(--main-text);">${escapeHtml(job.eligibility)}</div>
          </div>

          ${job.tags && job.tags.length > 0 ? `
            <div class="tag-list">
              ${job.tags.map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>

        <div class="card-actions">
          <a href="${job.applicationUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width: 100%;">
            View Details & Apply ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

