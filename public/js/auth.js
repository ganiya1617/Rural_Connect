// RuralConnect - Authentication Handler

document.addEventListener('DOMContentLoaded', () => {
  // If already logged in, redirect away from auth pages
  const user = api.getUser();
  const path = window.location.pathname;

  if (user && (path.includes('/login') || path.includes('/register'))) {
    redirectByRole(user.role);
    return;
  }

  // Login Form Handler
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Signing in...';

        const res = await api.post('/auth/login', { email, password });
        api.setAuth(res.token, res.user);
        showToast('Login successful! Redirecting...', 'success');

        setTimeout(() => {
          redirectByRole(res.user.role);
        }, 600);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Sign In';
      }
    });
  }

  // Student Registration Form Handler
  const studentRegForm = document.getElementById('student-register-form');
  if (studentRegForm) {
    studentRegForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const village = document.getElementById('village').value.trim();
      const district = document.getElementById('district').value.trim();
      const state = document.getElementById('state').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const submitBtn = studentRegForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating account...';

        const res = await api.post('/auth/register/student', {
          name, email, password, village, district, state, phone
        });
        api.setAuth(res.token, res.user);
        showToast('Registration successful! Welcome!', 'success');

        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 600);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Create Student Account';
      }
    });
  }

  // Mentor Registration Form Handler
  const mentorRegForm = document.getElementById('mentor-register-form');
  if (mentorRegForm) {
    mentorRegForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const designation = document.getElementById('designation').value.trim();
      const organization = document.getElementById('organization').value.trim();
      const expertise = document.getElementById('expertise').value.split(',').map(s => s.trim()).filter(Boolean);
      const subjects = document.getElementById('subjects').value.split(',').map(s => s.trim()).filter(Boolean);
      const experience = parseInt(document.getElementById('experience').value) || 0;
      const location = document.getElementById('location').value.trim();
      const bio = document.getElementById('bio').value.trim();
      const submitBtn = mentorRegForm.querySelector('button[type="submit"]');

      try {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Creating account...';

        const res = await api.post('/auth/register/mentor', {
          name, email, password, designation, organization,
          expertise, subjects, experience, location, bio
        });
        api.setAuth(res.token, res.user);
        showToast('Mentor Registration successful!', 'success');

        setTimeout(() => {
          window.location.href = '/mentor-dashboard';
        }, 600);
      } catch (err) {
        showToast(err.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Register as Mentor';
      }
    });
  }
});

function redirectByRole(role) {
  if (role === 'STUDENT') {
    window.location.href = '/dashboard';
  } else if (role === 'MENTOR') {
    window.location.href = '/mentor-dashboard';
  } else if (role === 'ADMIN') {
    window.location.href = '/admin';
  } else {
    window.location.href = '/';
  }
}
