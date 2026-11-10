# RuralConnect – Rural Education and Development Portal

**RuralConnect** is a full-stack web application designed to connect students from rural and underserved communities with quality educational materials, volunteer mentors, government welfare schemes, scholarships, quizzes, and career internships.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Strictly framework-free)
- **Backend:** Node.js, Express.js 5.3.0 (CommonJS syntax)
- **Database:** PostgreSQL 18
- **ORM:** Prisma 7.10.1 with `@prisma/adapter-pg` driver adapter
- **Security & Auth:** JSON Web Tokens (JWT), bcrypt (12 rounds)
- **Validation & Utilities:** express-validator, dotenv, cors

---

## 🎨 Color Palette & Visual Identity

- **Primary Blue:** `#2563EB`
- **Deep Navy:** `#172554`
- **Accent Green:** `#16A34A`
- **Light Green:** `#DCFCE7`
- **Background:** `#F8FAFC`
- **Card Background:** `#FFFFFF`
- **Main Text:** `#0F172A`
- **Secondary Text:** `#64748B`
- **Borders:** `#E2E8F0`

---

## 👥 User Roles & Capabilities

### 1. 🎒 Student
- Register & log in securely.
- Complete personal & academic profile (School, Board, Village, District, State).
- Personalized Dashboard with real-time statistics and recent activities.
- Explore curated learning resources (Videos, PDFs, Articles) with search and filters.
- Bookmark resources and track finished lessons.
- Take interactive timed quizzes with automatic score evaluation and solution explanations.
- Visualize learning progress and subject distribution charts.
- Connect with verified mentors and send personalized mentorship requests.
- Discover national scholarships and government welfare schemes.
- Apply for digital internships and entry-level career opportunities.

### 2. 👨‍🏫 Mentor / Teacher
- Register as an educator/mentor with designation, college/organization, and expertise.
- Mentor console with incoming mentorship requests.
- Accept or decline student requests in real-time.
- View connected student details (School, Village, Email).
- Share educational resources (PDFs, lectures, notes) directly to the platform.
- Manage professional profile and credentials.

### 3. 🛡️ Admin
- Secure role-protected Admin Console.
- Platform analytics (Students, Mentors, Resources, Quizzes, Schemes, Test attempts).
- User Management: Search users, toggle account active status, delete accounts.
- Complete Content CRUD:
  - Add & Delete Learning Resources
  - Add & Delete Scholarships / Schemes
  - Add & Delete Jobs & Internships
  - Create & Delete Quizzes
- System activity audit feed tracking real user interactions.

---

## 📁 Project Folder Structure

```
RuralConnect/
├── prisma/
│   ├── migrations/          # Prisma database migrations
│   ├── schema.prisma        # 13 relational models & 7 enums
│   └── seed.js              # Database seed script
├── public/
│   ├── css/
│   │   ├── style.css        # Base styles, typography, buttons, cards, modals, toasts
│   │   ├── dashboard.css    # Sidebar, stats grid, tables, quiz runner, activity feeds
│   │   └── responsive.css   # Breakpoints, mobile navbar, responsive tables
│   ├── js/
│   │   ├── api.js           # Standardized API client with JWT interceptor
│   │   ├── main.js          # Shared navbar, notifications, modal utilities
│   │   ├── auth.js          # Registration & Login handlers
│   │   ├── dashboard.js     # Student dashboard logic
│   │   ├── resources.js     # Resource search, filter, bookmark & completion
│   │   ├── mentors.js       # Mentor directory & request handler
│   │   ├── quizzes.js       # Quiz listing, interactive timer & test runner
│   │   ├── progress.js      # Progress tracker & analytics
│   │   ├── scholarships.js  # Schemes & scholarships explorer
│   │   ├── jobs.js          # Jobs & internships directory
│   │   ├── profile.js       # Profile editor & password updates
│   │   ├── mentor-dashboard.js # Mentor request management & resource publishing
│   │   └── admin.js         # Admin console analytics & CRUD operations
│   ├── pages/
│   │   ├── login.html
│   │   ├── register.html
│   │   ├── dashboard.html
│   │   ├── resources.html
│   │   ├── mentors.html
│   │   ├── quizzes.html
│   │   ├── progress.html
│   │   ├── scholarships.html
│   │   ├── jobs.html
│   │   ├── profile.html
│   │   ├── mentor-dashboard.html
│   │   └── admin.html
│   └── index.html           # Landing page
├── src/
│   ├── controllers/         # auth, student, mentor, resource, mentorship, quiz, opportunity, admin
│   ├── middleware/          # auth, validation, errorHandler
│   ├── routes/              # auth, students, mentors, resources, mentorship, quizzes, opportunities, admin
│   ├── db.js                # Prisma 7 Client with PostgreSQL driver adapter
│   └── index.js             # Express 5 application setup & static routing
├── prisma.config.ts         # Prisma 7 configuration file
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+ or v24+)
- PostgreSQL 18 running locally on port 5432

### 2. Environment Setup
Configure your `.env` file:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:ganu1617@localhost:5432/ruralconnect?schema=public"
JWT_SECRET="ruralconnect_super_secret_jwt_key_2026_change_in_production"
JWT_EXPIRES_IN="7d"
BCRYPT_ROUNDS=12
FRONTEND_URL="http://localhost:3000"
```

### 3. Database Migration & Seed
```bash
# Run migration
npm run db:migrate

# Seed database with initial courses, mentors, schemes, quizzes & test users
npm run db:seed
```

### 4. Start the Application
```bash
# Start server
npm start

# Or with nodemon for development
npm run dev
```

Visit **http://localhost:3000** in your web browser.

---

## 🔑 Pre-seeded Test Accounts

| Role | Email | Password |
|---|---|---|
| **Platform Admin** | `admin@ruralconnect.in` | `Admin@1234` |
| **Mentor / Teacher** | `priya.sharma@ruralconnect.in` | `Mentor@1234` |
| **Student** | `arjun.patel@example.com` | `Student@1234` |

