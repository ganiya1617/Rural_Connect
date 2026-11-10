// RuralConnect - Scholarships & Government Schemes Controller

document.addEventListener('DOMContentLoaded', () => {
  setupSchemeListeners();
  fetchSchemes();
});

function setupSchemeListeners() {
  const searchInput = document.getElementById('scheme-search');
  const typeFilter = document.getElementById('scheme-type-filter');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => fetchSchemes(), 300);
  });

  typeFilter.addEventListener('change', () => fetchSchemes());
}

async function fetchSchemes() {
  const grid = document.getElementById('schemes-grid');
  const search = document.getElementById('scheme-search').value.trim();
  const type = document.getElementById('scheme-type-filter').value;

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';

    const params = {};
    if (search) params.search = search;
    if (type) params.type = type;

    const res = await api.get('/opportunities/schemes', params);
    if (!res.success) throw new Error(res.message);

    renderSchemes(res.data);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

function renderSchemes(schemes) {
  const grid = document.getElementById('schemes-grid');
  if (!schemes || schemes.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏛️</div>
        <h3>No schemes match your criteria</h3>
        <p>Try clearing your search terms or filters.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = schemes.map(s => `
    <div class="card opportunity-card">
      <div>
        <div class="resource-card-header">
          <span class="badge ${s.type === 'SCHOLARSHIP' ? 'badge-blue' : 'badge-green'}">
            ${s.type === 'SCHOLARSHIP' ? '🎓 Scholarship' : '🏛️ Welfare Scheme'}
          </span>
          ${s.amount ? `<span class="badge badge-warning">${escapeHtml(s.amount)}</span>` : ''}
        </div>

        <h3 class="opportunity-title">${escapeHtml(s.title)}</h3>
        <div style="font-size: 0.85rem; color: var(--secondary-text); margin-bottom: 0.75rem;">
          Issued by: <strong>${escapeHtml(s.issuedBy || 'Government of India')}</strong>
        </div>

        <p class="resource-desc" style="margin-bottom: 1rem;">
          ${escapeHtml(s.description)}
        </p>

        <div style="margin-bottom: 1rem; background: #F8FAFC; padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--borders);">
          <div style="font-size: 0.82rem; font-weight: 600; color: var(--deep-navy); margin-bottom: 0.2rem;">ELIGIBILITY:</div>
          <div style="font-size: 0.85rem; color: var(--secondary-text);">${escapeHtml(s.eligibility)}</div>

          <div style="font-size: 0.82rem; font-weight: 600; color: var(--deep-navy); margin-top: 0.5rem; margin-bottom: 0.2rem;">BENEFITS:</div>
          <div style="font-size: 0.85rem; color: var(--accent-green); font-weight: 500;">${escapeHtml(s.benefits)}</div>
        </div>

        ${s.documents && s.documents.length > 0 ? `
          <div style="margin-bottom: 1rem;">
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--secondary-text); margin-bottom: 0.3rem;">DOCUMENTS NEEDED:</div>
            <div class="tag-list">
              ${s.documents.map(doc => `<span class="tag-pill">📄 ${escapeHtml(doc)}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div class="card-actions">
        <a href="${s.applicationUrl || '#'}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width: 100%;">
          Apply on Official Portal ↗
        </a>
      </div>
    </div>
  `).join('');
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

