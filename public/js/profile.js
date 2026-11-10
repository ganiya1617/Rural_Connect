// RuralConnect - Profile Management Controller

let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
  const user = checkAuth();
  if (!user) return;

  await loadProfile();
  setupProfileForms();
});

async function loadProfile() {
  try {
    const res = await api.get('/auth/me');
    if (!res.success) throw new Error(res.message);

    currentUser = res.user;

    document.getElementById('profile-name').value = currentUser.name || '';
    document.getElementById('profile-email').value = currentUser.email || '';

    if (currentUser.role === 'STUDENT') {
      document.getElementById('student-fields').style.display = 'block';
      const sp = currentUser.studentProfile || {};
      document.getElementById('profile-village').value = sp.village || '';
      document.getElementById('profile-district').value = sp.district || '';
      document.getElementById('profile-state').value = sp.state || '';
      document.getElementById('profile-class').value = sp.class || '';
      document.getElementById('profile-school').value = sp.school || '';
      document.getElementById('profile-board').value = sp.board || '';
      document.getElementById('profile-interests').value = (sp.interests || []).join(', ');
      document.getElementById('profile-bio').value = sp.bio || '';
    } else if (currentUser.role === 'MENTOR') {
      document.getElementById('mentor-fields').style.display = 'block';
      const mp = currentUser.mentorProfile || {};
      document.getElementById('mentor-designation').value = mp.designation || '';
      document.getElementById('mentor-organization').value = mp.organization || '';
      document.getElementById('mentor-expertise').value = (mp.expertise || []).join(', ');
      document.getElementById('mentor-subjects').value = (mp.subjects || []).join(', ');
      document.getElementById('mentor-experience').value = mp.experience || 0;
      document.getElementById('mentor-location').value = mp.location || '';
      document.getElementById('mentor-bio').value = mp.bio || '';
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function setupProfileForms() {
  // Profile update form
  const detailsForm = document.getElementById('profile-details-form');
  detailsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('save-profile-btn');

    try {
      btn.disabled = true;
      btn.innerText = 'Saving...';

      const name = document.getElementById('profile-name').value.trim();

      if (currentUser.role === 'STUDENT') {
        const body = {
          name,
          village: document.getElementById('profile-village').value.trim(),
          district: document.getElementById('profile-district').value.trim(),
          state: document.getElementById('profile-state').value.trim(),
          class: document.getElementById('profile-class').value.trim(),
          school: document.getElementById('profile-school').value.trim(),
          board: document.getElementById('profile-board').value.trim(),
          interests: document.getElementById('profile-interests').value.split(',').map(s => s.trim()).filter(Boolean),
          bio: document.getElementById('profile-bio').value.trim(),
        };
        await api.put('/students/profile', body);
      } else if (currentUser.role === 'MENTOR') {
        const body = {
          name,
          designation: document.getElementById('mentor-designation').value.trim(),
          organization: document.getElementById('mentor-organization').value.trim(),
          expertise: document.getElementById('mentor-expertise').value.split(',').map(s => s.trim()).filter(Boolean),
          subjects: document.getElementById('mentor-subjects').value.split(',').map(s => s.trim()).filter(Boolean),
          experience: parseInt(document.getElementById('mentor-experience').value) || 0,
          location: document.getElementById('mentor-location').value.trim(),
          bio: document.getElementById('mentor-bio').value.trim(),
        };
        await api.put('/mentors/me/profile', body);
      }

      // Update cached user object name
      const cached = api.getUser();
      if (cached) {
        cached.name = name;
        api.setAuth(api.getToken(), cached);
      }

      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Save Changes';
    }
  });

  // Password form
  const pwdForm = document.getElementById('password-form');
  pwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('change-pwd-btn');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;

    try {
      btn.disabled = true;
      btn.innerText = 'Updating...';

      const res = await api.put('/auth/change-password', { currentPassword, newPassword });
      showToast(res.message, 'success');
      pwdForm.reset();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Update Password';
    }
  });
}
