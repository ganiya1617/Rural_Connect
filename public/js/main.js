// RuralConnect - Main UI Helper & Navigation

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupToastContainer();
  highlightActiveNav();
  setupMobileToggle();
});

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button style="background:none; border:none; cursor:pointer; color:#64748B; font-size:1.1rem;" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setupToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
}

// Setup Dynamic Navbar based on user authentication
function setupNavbar() {
  const user = api.getUser();
  const navActions = document.getElementById('nav-actions');
  const userNavLinks = document.getElementById('user-nav-links');

  if (navActions) {
    if (user) {
      let dashboardUrl = '/dashboard';
      if (user.role === 'MENTOR') dashboardUrl = '/mentor-dashboard';
      if (user.role === 'ADMIN') dashboardUrl = '/admin';

      navActions.innerHTML = `
        <a href="${dashboardUrl}" class="btn btn-outline btn-sm">Dashboard</a>
        <a href="/profile" class="btn btn-outline btn-sm" title="My Profile">👤 ${user.name.split(' ')[0]}</a>
        <button id="logout-btn" class="btn btn-danger-outline btn-sm" onclick="logout()">Logout</button>
      `;

      if (userNavLinks) {
        if (user.role === 'STUDENT') {
          userNavLinks.innerHTML = `
            <li><a href="/resources">Study Materials</a></li>
            <li><a href="/mentors">Mentors</a></li>
            <li><a href="/quizzes">Quizzes</a></li>
            <li><a href="/scholarships">Grants & Loans</a></li>
            <li><a href="/jobs">Jobs & Internships</a></li>
            <li><a href="/progress">My Progress</a></li>
          `;
        } else if (user.role === 'MENTOR') {
          userNavLinks.innerHTML = `
            <li><a href="/mentor-dashboard">Mentor Portal</a></li>
            <li><a href="/resources">Browse Materials</a></li>
            <li><a href="/scholarships">Grants & Loans</a></li>
            <li><a href="/jobs">Jobs & Opportunities</a></li>
          `;
        } else if (user.role === 'ADMIN') {
          userNavLinks.innerHTML = `
            <li><a href="/admin">Admin Console</a></li>
            <li><a href="/resources">Resources</a></li>
            <li><a href="/scholarships">Grants & Loans</a></li>
            <li><a href="/jobs">Jobs & Internships</a></li>
          `;
        }
      }
    } else {
      navActions.innerHTML = `
        <a href="/login" class="btn btn-outline btn-sm">Login</a>
        <a href="/register" class="btn btn-primary btn-sm">Sign Up</a>
      `;
      if (userNavLinks) {
        userNavLinks.innerHTML = `
          <li><a href="/resources">Study Materials</a></li>
          <li><a href="/mentors">Mentors</a></li>
          <li><a href="/scholarships">Grants & Loans</a></li>
          <li><a href="/jobs">Jobs & Internships</a></li>
        `;
      }
    }
  }
}

function highlightActiveNav() {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-links a, .sidebar-nav a').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
}

function setupMobileToggle() {
  const toggleBtn = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navActions = document.querySelector('.nav-actions');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      if (navActions) navActions.classList.toggle('active');
    });
  }
}

// Authentication helpers
function logout() {
  api.clearAuth();
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = '/login';
  }, 500);
}

function checkAuth(requiredRole = null) {
  const user = api.getUser();
  const token = api.getToken();

  if (!token || !user) {
    window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'STUDENT') window.location.href = '/dashboard';
    else if (user.role === 'MENTOR') window.location.href = '/mentor-dashboard';
    else if (user.role === 'ADMIN') window.location.href = '/admin';
    return null;
  }

  return user;
}

// Modal open/close helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
