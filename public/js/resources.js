// RuralConnect - Learning Resources Controller

let currentResources = [];
let myBookmarks = new Set();
let viewingSavedOnly = false;

document.addEventListener('DOMContentLoaded', async () => {
  setupFilterListeners();
  await loadUserBookmarks();
  await fetchResources();
});

function setupFilterListeners() {
  const searchInput = document.getElementById('search-input');
  const subjectFilter = document.getElementById('subject-filter');
  const typeFilter = document.getElementById('type-filter');

  let debounceTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchResources();
    }, 350);
  });

  subjectFilter.addEventListener('change', () => fetchResources());
  typeFilter.addEventListener('change', () => fetchResources());
}

async function loadUserBookmarks() {
  const user = api.getUser();
  if (!user) return;

  try {
    const res = await api.get('/resources/me/bookmarks');
    if (res.success && res.data) {
      myBookmarks = new Set(res.data.map(b => b.resourceId));
    }
  } catch (e) {
    console.warn('Could not fetch user bookmarks:', e);
  }
}

async function fetchResources() {
  const grid = document.getElementById('resources-grid');
  const countEl = document.getElementById('resource-count');

  if (viewingSavedOnly) {
    await fetchSavedBookmarks();
    return;
  }

  const search = document.getElementById('search-input').value.trim();
  const subject = document.getElementById('subject-filter').value;
  const type = document.getElementById('type-filter').value;

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';

    const params = {};
    if (search) params.search = search;
    if (subject) params.subject = subject;
    if (type) params.type = type;

    const res = await api.get('/resources', params);
    if (!res.success) throw new Error(res.message);

    currentResources = res.data;
    countEl.innerText = `Showing ${currentResources.length} learning resources`;
    renderResourceCards(currentResources);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

async function fetchSavedBookmarks() {
  const grid = document.getElementById('resources-grid');
  const countEl = document.getElementById('resource-count');
  const user = api.getUser();

  if (!user) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Please Sign In</h3>
        <p>You must be signed in to view your bookmarks.</p>
        <a href="/login" class="btn btn-primary" style="margin-top: 1rem;">Login Now</a>
      </div>
    `;
    return;
  }

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';
    const res = await api.get('/resources/me/bookmarks');
    const bookmarks = res.data.map(b => b.resource);
    countEl.innerText = `Showing ${bookmarks.length} saved bookmarks`;
    renderResourceCards(bookmarks);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;"><p>${err.message}</p></div>`;
  }
}

function renderResourceCards(items) {
  const grid = document.getElementById('resources-grid');
  if (!items || items.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔍</div>
        <h3>No resources match your search</h3>
        <p>Try clearing your filters or search keywords.</p>
      </div>
    `;
    return;
  }

  const user = api.getUser();

  grid.innerHTML = items.map(res => {
    const isBookmarked = myBookmarks.has(res.id);
    const typeIcon = res.type === 'VIDEO' ? '🎥' : res.type === 'PDF' ? '📄' : '📖';
    const typeBadge = res.type === 'VIDEO' ? 'badge-blue' : res.type === 'PDF' ? 'badge-warning' : 'badge-green';

    return `
      <div class="card resource-card">
        <div>
          <div class="resource-card-header">
            <span class="badge ${typeBadge}">${typeIcon} ${res.type}</span>
            <span class="badge badge-secondary">${escapeHtml(res.subject)}</span>
          </div>

          <h3 class="resource-title">${escapeHtml(res.title)}</h3>
          <p class="resource-desc">${escapeHtml(res.description)}</p>

          <div class="tag-list">
            ${(res.tags || []).map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; color: var(--secondary-text); margin-bottom: 0.75rem;">
            Difficulty: <strong>${res.difficulty}</strong> • Views: <strong>${res.viewCount}</strong>
          </div>

          <div class="card-actions">
            <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" onclick="trackView('${res.id}')">
              Open Resource ↗
            </a>

            ${user ? `
              <button class="btn ${isBookmarked ? 'btn-danger-outline' : 'btn-outline'} btn-sm" onclick="handleBookmark('${res.id}')" title="Bookmark">
                ${isBookmarked ? '❤️ Saved' : '🔖 Save'}
              </button>
              ${user.role === 'STUDENT' ? `
                <button class="btn btn-outline btn-sm" onclick="handleComplete('${res.id}')" title="Mark as Finished">
                  ✅ Done
                </button>
              ` : ''}
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

async function handleBookmark(resourceId) {
  const user = api.getUser();
  if (!user) {
    showToast('Please sign in to bookmark resources', 'info');
    setTimeout(() => window.location.href = '/login', 1000);
    return;
  }

  try {
    const res = await api.post(`/resources/${resourceId}/bookmark`);
    if (res.bookmarked) {
      myBookmarks.add(resourceId);
      showToast('Added to your bookmarks!', 'success');
    } else {
      myBookmarks.delete(resourceId);
      showToast('Removed from bookmarks.', 'info');
    }
    if (viewingSavedOnly) {
      fetchSavedBookmarks();
    } else {
      renderResourceCards(currentResources);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleComplete(resourceId) {
  try {
    const res = await api.post(`/resources/${resourceId}/complete`);
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function trackView(resourceId) {
  // Triggers GET /api/resources/:id which increments viewCount
  try {
    await api.get(`/resources/${resourceId}`);
  } catch (e) {
    // Non-blocking
  }
}

function toggleSavedFilter(showSaved) {
  viewingSavedOnly = showSaved;
  const allBtn = document.getElementById('view-all-btn');
  const savedBtn = document.getElementById('view-saved-btn');

  if (showSaved) {
    savedBtn.classList.replace('btn-outline', 'btn-primary');
    allBtn.classList.replace('btn-primary', 'btn-outline');
    fetchSavedBookmarks();
  } else {
    allBtn.classList.replace('btn-outline', 'btn-primary');
    savedBtn.classList.replace('btn-primary', 'btn-outline');
    fetchResources();
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
