// RuralConnect - Learning Resources Controller

let currentResources = [];
let myBookmarks = new Set();
let myCompleted = new Set();
let currentView = 'all'; // 'all' | 'saved' | 'completed'

document.addEventListener('DOMContentLoaded', async () => {
  setupFilterListeners();
  await loadUserData();
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

async function loadUserData() {
  const user = api.getUser();
  if (!user) return;

  try {
    const [bmRes, compRes] = await Promise.all([
      api.get('/resources/me/bookmarks'),
      api.get('/resources/me/completed'),
    ]);

    if (bmRes.success && bmRes.data) {
      myBookmarks = new Set(bmRes.data.map(b => b.resourceId));
    }
    if (compRes.success && compRes.data) {
      myCompleted = new Set(compRes.data.map(c => c.resourceId));
    }
  } catch (e) {
    console.warn('Could not fetch user bookmarks/completed:', e);
  }
}

async function fetchResources() {
  const grid = document.getElementById('resources-grid');
  const countEl = document.getElementById('resource-count');

  if (currentView === 'saved') {
    await fetchSavedBookmarks();
    return;
  }
  if (currentView === 'completed') {
    await fetchCompletedResources();
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

async function fetchCompletedResources() {
  const grid = document.getElementById('resources-grid');
  const countEl = document.getElementById('resource-count');
  const user = api.getUser();

  if (!user) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <h3>Please Sign In</h3>
        <p>Sign in to view your completed lessons.</p>
        <a href="/login" class="btn btn-primary" style="margin-top: 1rem;">Login Now</a>
      </div>
    `;
    return;
  }

  try {
    grid.innerHTML = '<div class="loading-spinner" style="margin: 3rem auto; grid-column: 1 / -1;"></div>';
    const res = await api.get('/resources/me/completed');
    const completedList = (res.data || []).map(c => c.resource).filter(Boolean);
    countEl.innerText = `Showing ${completedList.length} completed lessons`;
    renderResourceCards(completedList);
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
        <h3>No resources found</h3>
        <p>Try clearing your search filters or check back soon.</p>
      </div>
    `;
    return;
  }

  const user = api.getUser();

  grid.innerHTML = items.map(res => {
    const isBookmarked = myBookmarks.has(res.id);
    const isCompleted = myCompleted.has(res.id);
    const typeIcon = res.type === 'VIDEO' ? '🎥' : res.type === 'PDF' ? '📄' : '📖';
    const typeBadge = res.type === 'VIDEO' ? 'badge-blue' : res.type === 'PDF' ? 'badge-warning' : 'badge-green';

    // Check if YouTube
    const isYouTube = res.url && (res.url.includes('youtube.com') || res.url.includes('youtu.be'));

    return `
      <div class="card resource-card" id="card-${res.id}" style="${isCompleted ? 'border: 2px solid var(--accent-green); background: #F0FDF4;' : ''}">
        <div>
          <div class="resource-card-header">
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <span class="badge ${typeBadge}">${typeIcon} ${res.type}</span>
              <span class="badge badge-secondary">${escapeHtml(res.subject)}</span>
            </div>
            ${isCompleted ? `
              <span class="badge badge-green" style="font-weight: 700; font-size: 0.8rem;">
                ✓ Completed
              </span>
            ` : ''}
          </div>

          <h3 class="resource-title" style="margin-top: 0.4rem;">
            ${escapeHtml(res.title)}
          </h3>
          <p class="resource-desc">${escapeHtml(res.description)}</p>

          <div class="tag-list">
            ${(res.tags || []).map(t => `<span class="tag-pill">#${escapeHtml(t)}</span>`).join('')}
          </div>
        </div>

        <div>
          <div style="font-size: 0.8rem; color: var(--secondary-text); margin-bottom: 0.75rem;">
            Level: <strong>${res.difficulty}</strong> • Views: <strong>${res.viewCount}</strong>
          </div>

          <div class="card-actions">
            ${isYouTube ? `
              <button class="btn btn-primary btn-sm" onclick="watchVideo('${escapeHtml(res.url)}', '${escapeHtml(res.title)}', '${res.id}')">
                ▶ Watch Video
              </button>
            ` : `
              <a href="${res.url}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" onclick="trackView('${res.id}')">
                ${res.type === 'PDF' ? '📥 Open PDF ↗' : 'Explore Resource ↗'}
              </a>
            `}

            ${user ? `
              <button class="btn ${isBookmarked ? 'btn-danger-outline' : 'btn-outline'} btn-sm" onclick="handleBookmark('${res.id}')" title="Bookmark">
                ${isBookmarked ? '❤️ Saved' : '🔖 Save'}
              </button>
              ${user.role === 'STUDENT' ? `
                <button class="btn ${isCompleted ? 'btn-success' : 'btn-outline'} btn-sm" onclick="handleComplete('${res.id}')" title="Toggle Completed">
                  ${isCompleted ? '✓ Completed' : 'Mark as Done'}
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
    rerenderCurrentView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleComplete(resourceId) {
  try {
    const res = await api.post(`/resources/${resourceId}/complete`);
    if (res.completed) {
      myCompleted.add(resourceId);
      showToast('Awesome job! Lesson marked as completed ✓', 'success');
    } else {
      myCompleted.delete(resourceId);
      showToast('Lesson unmarked from completed.', 'info');
    }
    rerenderCurrentView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function rerenderCurrentView() {
  if (currentView === 'saved') {
    fetchSavedBookmarks();
  } else if (currentView === 'completed') {
    fetchCompletedResources();
  } else {
    renderResourceCards(currentResources);
  }
}

function watchVideo(url, title, resourceId) {
  trackView(resourceId);
  const modal = document.getElementById('video-modal');
  const iframe = document.getElementById('video-iframe');
  const modalTitle = document.getElementById('video-modal-title');
  const extLink = document.getElementById('video-external-link');

  modalTitle.innerText = title;
  extLink.href = url;

  // Extract YouTube video ID
  let videoId = '';
  if (url.includes('v=')) {
    videoId = url.split('v=')[1].split('&')[0];
  } else if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1].split('?')[0];
  }

  if (videoId) {
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    openModal('video-modal');
  } else {
    // If not standard youtube id, open directly
    window.open(url, '_blank');
  }
}

function closeVideoModal() {
  const iframe = document.getElementById('video-iframe');
  if (iframe) iframe.src = '';
  closeModal('video-modal');
}

async function trackView(resourceId) {
  try {
    await api.get(`/resources/${resourceId}`);
  } catch (e) {}
}

function switchResourceView(view) {
  currentView = view;
  const allBtn = document.getElementById('view-all-btn');
  const savedBtn = document.getElementById('view-saved-btn');
  const compBtn = document.getElementById('view-completed-btn');

  allBtn.className = view === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
  savedBtn.className = view === 'saved' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
  compBtn.className = view === 'completed' ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';

  fetchResources();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
