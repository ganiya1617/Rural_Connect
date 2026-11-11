'use strict';

/**
 * RuralConnect - Complete Full-Stack Test Suite
 * Tests all pages, APIs, authentication, and core domain requirements.
 */

const http = require('http');

async function runTests() {
  console.log('=================================================================');
  console.log('🧪 RURALCONNECT – COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
  console.log('=================================================================\n');

  let passed = 0;
  let total = 0;

  function report(name, isOk, extra = '') {
    total++;
    if (isOk) {
      passed++;
      console.log(`  ✅ ${name}${extra ? ' (' + extra + ')' : ''}`);
    } else {
      console.error(`  ❌ ${name}${extra ? ' (' + extra + ')' : ''}`);
    }
  }

  async function request(url, options = {}) {
    try {
      const res = await fetch(`http://localhost:3000${url}`, options);
      const isJson = (res.headers.get('content-type') || '').includes('application/json');
      const body = isJson ? await res.json() : await res.text();
      return { status: res.status, ok: res.ok, body };
    } catch (err) {
      return { status: 0, ok: false, error: err.message };
    }
  }

  // ── 1. Basic Health ──────────────────────────────────────────────────────────
  console.log('1. Health & Server Status:');
  const health = await request('/health');
  report('GET /health (Server Online)', health.status === 200 && health.body.status === 'ok');

  // ── 2. All 13 Frontend Page Deliveries ────────────────────────────────────────
  console.log('\n2. Frontend Pages Delivery (HTML5 / Zero-framework):');
  const pages = [
    '/', '/login', '/register', '/dashboard', '/resources',
    '/mentors', '/quizzes', '/progress', '/scholarships',
    '/jobs', '/profile', '/mentor-dashboard', '/admin'
  ];

  for (const page of pages) {
    const res = await request(page);
    report(`Page Render: ${page}`, res.status === 200 && res.body.includes('<!DOCTYPE html>'));
  }

  // ── 3. Static Assets Verification ────────────────────────────────────────────
  console.log('\n3. CSS & Modular JS Assets:');
  const assets = [
    '/css/style.css', '/css/dashboard.css', '/css/responsive.css',
    '/js/api.js', '/js/main.js', '/js/auth.js', '/js/dashboard.js',
    '/js/resources.js', '/js/mentors.js', '/js/quizzes.js',
    '/js/progress.js', '/js/scholarships.js', '/js/jobs.js',
    '/js/profile.js', '/js/mentor-dashboard.js', '/js/admin.js'
  ];

  for (const asset of assets) {
    const res = await request(asset);
    report(`Asset: ${asset}`, res.status === 200 && res.body.length > 50);
  }

  // ── 4. Authentication & Role-Based Authorization ────────────────────────────
  console.log('\n4. Authentication & Security:');

  // Student Login
  const studentAuth = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'arjun.patel@example.com', password: 'Student@1234' }),
  });
  const studentToken = studentAuth.body?.token;
  report('Student Login (Arjun Patel)', studentAuth.status === 200 && !!studentToken);

  // Mentor Login
  const mentorAuth = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.sharma@ruralconnect.in', password: 'Mentor@1234' }),
  });
  const mentorToken = mentorAuth.body?.token;
  report('Mentor Login (Priya Sharma)', mentorAuth.status === 200 && !!mentorToken);

  // Admin Login
  const adminAuth = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@ruralconnect.in', password: 'Admin@1234' }),
  });
  const adminToken = adminAuth.body?.token;
  report('Admin Login (Platform Admin)', adminAuth.status === 200 && !!adminToken);

  // Role Restriction: Student blocked from Admin API
  const forbiddenCheck = await request('/api/admin/stats', {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  report('Role Authorization Guard (Student blocked with 403 Forbidden)', forbiddenCheck.status === 403);

  // ── 5. Domain Requirements Verification ─────────────────────────────────────
  console.log('\n5. Smart Education Domain Pillars:');

  // Resources & Completion Tick
  const resourcesRes = await request('/api/resources');
  const resources = resourcesRes.body?.data || [];
  report('Educational Study Materials', resources.length >= 10, `${resources.length} available`);

  if (resources.length > 0) {
    const testResId = resources[0].id;
    const compToggle = await request(`/api/resources/${testResId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    report('Completion Tick Toggle (POST /api/resources/:id/complete)', compToggle.status === 200 && typeof compToggle.body.completed === 'boolean');

    const myCompleted = await request('/api/resources/me/completed', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    report('Completed Lessons Record (GET /api/resources/me/completed)', myCompleted.status === 200 && Array.isArray(myCompleted.body.data));
  }

  // Grants, Loans, Incentives & KFON
  const schemesRes = await request('/api/opportunities/schemes');
  const schemes = schemesRes.body?.data || [];
  const hasKfon = schemes.some(s => s.type === 'CONNECTIVITY_GRANT' || s.title.includes('KFON'));
  const hasLoan = schemes.some(s => s.type === 'EDUCATION_LOAN' || s.title.includes('Vidya Lakshmi'));
  report('Connectivity Grants (KFON - Free Internet for Underserved)', hasKfon);
  report('Educational Loans & Subsidies (Vidya Lakshmi & CSIS)', hasLoan);

  // Verified Internships & Employment
  const jobsRes = await request('/api/opportunities/jobs');
  const jobs = jobsRes.body?.data || [];
  const hasInternshala = jobs.some(j => j.applicationUrl?.includes('internshala.com'));
  const hasAicte = jobs.some(j => j.applicationUrl?.includes('aicte-india.org'));
  report('Employment Portals (Internshala & AICTE Portal)', hasInternshala && hasAicte);

  // Quizzes & Scoring
  const quizzesRes = await request('/api/quizzes');
  const quizzes = quizzesRes.body?.data || [];
  report('Interactive Subject Assessments', quizzes.length >= 2, `${quizzes.length} quizzes`);

  console.log('\n=================================================================');
  console.log(`SUMMARY: ${passed} / ${total} CHECKS PASSED ✅`);
  console.log('=================================================================\n');

  process.exit(passed === total ? 0 : 1);
}

runTests();

