'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding RuralConnect database with real-world educational resources & opportunities...');

  const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;

  // ── Admin User ──────────────────────────────────────────────────────────────
  const adminPass = await bcrypt.hash('Admin@1234', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'admin@ruralconnect.in' },
    update: {},
    create: {
      email: 'admin@ruralconnect.in',
      password: adminPass,
      name: 'Platform Admin',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created: admin@ruralconnect.in / Admin@1234');

  // ── Mentors ─────────────────────────────────────────────────────────────────
  const mentorPass = await bcrypt.hash('Mentor@1234', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'priya.sharma@ruralconnect.in' },
    update: {},
    create: {
      email: 'priya.sharma@ruralconnect.in',
      password: mentorPass,
      name: 'Priya Sharma',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          designation: 'Senior Software Engineer',
          organization: 'Tata Consultancy Services',
          bio: 'Passionate about empowering rural students through technology education. 8+ years experience in software development and mentoring.',
          expertise: ['JavaScript', 'Python', 'Web Development', 'Computer Basics'],
          subjects: ['Computer Science', 'Mathematics'],
          qualifications: ['B.Tech - IIT Delhi', 'M.Tech - BITS Pilani'],
          experience: 8,
          location: 'Bangalore / Remote',
          isAvailable: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'rajesh.kumar@ruralconnect.in' },
    update: {},
    create: {
      email: 'rajesh.kumar@ruralconnect.in',
      password: mentorPass,
      name: 'Dr. Rajesh Kumar',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          designation: 'Science Teacher & Researcher',
          organization: 'Delhi University',
          bio: 'Dedicated educator with 12 years of teaching Physics and Chemistry to rural students across India.',
          expertise: ['Physics', 'Chemistry', 'Competitive Exam Prep'],
          subjects: ['Physics', 'Chemistry', 'Science'],
          qualifications: ['M.Sc Physics - Delhi University', 'PhD - IISc Bangalore'],
          experience: 12,
          location: 'Delhi',
          isAvailable: true,
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'anita.desai@ruralconnect.in' },
    update: {},
    create: {
      email: 'anita.desai@ruralconnect.in',
      password: mentorPass,
      name: 'Anita Desai',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          designation: 'Head of Mathematics Department',
          organization: 'Kendriya Vidyalaya',
          bio: 'Specialist in making algebra and calculus easy and intuitive for secondary students.',
          expertise: ['Algebra', 'Calculus', 'Geometry', 'Vedic Maths'],
          subjects: ['Mathematics'],
          qualifications: ['M.Sc Mathematics - Pune University', 'B.Ed'],
          experience: 10,
          location: 'Pune / Remote',
          isAvailable: true,
        },
      },
    },
  });
  console.log('✅ Mentors created');

  // ── Sample Student ──────────────────────────────────────────────────────────
  const studentPass = await bcrypt.hash('Student@1234', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'arjun.patel@example.com' },
    update: {},
    create: {
      email: 'arjun.patel@example.com',
      password: studentPass,
      name: 'Arjun Patel',
      role: 'STUDENT',
      studentProfile: {
        create: {
          village: 'Vadodara Rural',
          district: 'Vadodara',
          state: 'Gujarat',
          class: '12th',
          school: 'Govt. Higher Secondary School',
          board: 'GSEB',
          interests: ['Science', 'Technology', 'Mathematics'],
          bio: 'Aspiring engineer from rural Gujarat.',
        },
      },
    },
  });
  console.log('✅ Sample student created');

  // ── Clear & Re-seed Resources with Working Links ───────────────────────────
  await prisma.bookmark.deleteMany({});
  await prisma.completedResource.deleteMany({});
  await prisma.resource.deleteMany({});

  const resources = [
    {
      title: 'Python for Beginners – Full Free Course',
      description: 'World-renowned beginner Python programming course by freeCodeCamp. Covers setup, variables, loops, data structures, and functions.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Python Programming',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      difficulty: 'BEGINNER',
      tags: ['python', 'programming', 'freecodecamp', 'coding'],
    },
    {
      title: 'NCERT Official Class 10 Science Textbook & Solutions',
      description: 'Official National Council of Educational Research and Training (NCERT) textbook covering Physics, Chemistry, and Biology.',
      type: 'PDF',
      subject: 'Science',
      topic: 'NCERT Class 10 Science',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      difficulty: 'BEGINNER',
      tags: ['ncert', 'class10', 'science', 'cbse'],
    },
    {
      title: 'Khan Academy – Complete Calculus Essentials',
      description: 'In-depth interactive video series explaining limits, derivatives, rules of differentiation, and definite integrals intuitively.',
      type: 'VIDEO',
      subject: 'Mathematics',
      topic: 'Calculus',
      url: 'https://www.youtube.com/watch?v=7K1kkp3f6sI',
      difficulty: 'INTERMEDIATE',
      tags: ['calculus', 'maths', 'khan-academy', 'class12'],
    },
    {
      title: 'OpenStax Free College Physics Textbook',
      description: 'Peer-reviewed, open-licensed introductory college physics textbook covering mechanics, thermodynamics, waves, and optics.',
      type: 'PDF',
      subject: 'Physics',
      topic: 'College Physics',
      url: 'https://openstax.org/details/books/college-physics',
      difficulty: 'INTERMEDIATE',
      tags: ['physics', 'openstax', 'textbook', 'mechanics'],
    },
    {
      title: 'Computer Basics & Digital Literacy Tutorial',
      description: 'Essential digital skills training covering keyboard shortcuts, mouse handling, operating system navigation, folders, and internet safety.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Digital Literacy',
      url: 'https://www.youtube.com/watch?v=x3c1IH2NJEg',
      difficulty: 'BEGINNER',
      tags: ['digital-literacy', 'computer', 'basics', 'skills'],
    },
    {
      title: 'Chemistry Essentials – CrashCourse Chemistry',
      description: 'Fast-paced, highly engaging 46-episode series covering the periodic table, atomic structure, stoichiometry, and chemical reactions.',
      type: 'VIDEO',
      subject: 'Chemistry',
      topic: 'General Chemistry',
      url: 'https://www.youtube.com/watch?v=FSyAehMdpyI',
      difficulty: 'BEGINNER',
      tags: ['chemistry', 'crashcourse', 'science', 'reactions'],
    },
    {
      title: 'SWAYAM Government Free Online Courses',
      description: 'Free digital learning platform initiated by the Ministry of Education, Government of India, featuring certified courses from IITs and IIMs.',
      type: 'ARTICLE',
      subject: 'General Education',
      topic: 'Higher Education',
      url: 'https://swayam.gov.in/',
      difficulty: 'INTERMEDIATE',
      tags: ['swayam', 'government', 'iit', 'higher-education'],
    },
    {
      title: 'freeCodeCamp – Learn Responsive Web Design',
      description: 'Interactive coding curriculum teaching HTML5, CSS3, Flexbox, CSS Grid, and responsive web development principles completely free.',
      type: 'ARTICLE',
      subject: 'Computer Science',
      topic: 'Web Development',
      url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
      difficulty: 'BEGINNER',
      tags: ['web-development', 'html', 'css', 'coding'],
    },
    {
      title: 'NCERT Class 12 Mathematics Textbook (Part 1 & 2)',
      description: 'Official free textbook for Class 12 Senior Secondary Mathematics covering matrices, determinants, continuity, and vector algebra.',
      type: 'PDF',
      subject: 'Mathematics',
      topic: 'Class 12 Maths',
      url: 'https://ncert.nic.in/textbook.php?lemh1=0-6',
      difficulty: 'ADVANCED',
      tags: ['ncert', 'maths', 'class12', 'cbse'],
    },
    {
      title: 'English Grammar & Vocabulary – British Council Learning',
      description: 'Comprehensive guides, quizzes, and reference worksheets to master English grammar, tense structures, and spoken communication.',
      type: 'ARTICLE',
      subject: 'English',
      topic: 'Grammar & Spoken English',
      url: 'https://learnenglish.britishcouncil.org/grammar',
      difficulty: 'BEGINNER',
      tags: ['english', 'grammar', 'communication', 'british-council'],
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log(`✅ ${resources.length} verified learning resources created`);

  // ── Clear & Re-seed Schemes with Live Official Portals ──────────────────────
  await prisma.scheme.deleteMany({});

  const schemes = [
    {
      title: 'National Scholarship Portal (NSP) – Central & State Schemes',
      description: 'One-stop electronic platform created by the Government of India providing access to over 50+ centrally sponsored, state, and UGC scholarships for pre-matric and post-matric rural students.',
      type: 'SCHOLARSHIP',
      eligibility: 'School and college students with family annual income under Rs. 2.5 Lakh. Merit and means criteria vary by specific scheme.',
      benefits: 'Full tuition fee reimbursement + annual maintenance stipend up to Rs. 20,000 to Rs. 50,000/year.',
      documents: ['Aadhaar Card', 'Income Certificate', 'Previous Year Marksheet', 'Bank Passbook Details', 'Caste Certificate (if applicable)'],
      amount: 'Rs. 12,000 – 50,000 / year',
      applicationUrl: 'https://scholarships.gov.in/',
      issuedBy: 'Ministry of Electronics & IT / Ministry of Education, Govt of India',
    },
    {
      title: 'Buddy4Study – India’s Largest Scholarship Search Engine',
      description: 'Comprehensive scholarship discovery platform connecting underprivileged students with verified private, corporate CSR, and foundation scholarships across India.',
      type: 'SCHOLARSHIP',
      eligibility: 'Students from Class 1 to Post-Graduation. Specialized filters for rural youth, girls, and STEM students.',
      benefits: 'Financial assistance ranging from school fee subsidies to full college ride sponsorship.',
      documents: ['Academic transcripts', 'Income proof', 'Family ration card', 'Identity proof'],
      amount: 'Rs. 10,000 – 1,00,000 / year',
      applicationUrl: 'https://www.buddy4study.com/',
      issuedBy: 'Buddy4Study Foundation & Corporate CSR Partners',
    },
    {
      title: 'National Means-cum-Merit Scholarship (NMMS)',
      description: 'Central Government scheme to award meritorious students of economically weaker sections to arrest their drop out at Class 8 and encourage them to continue studies at secondary stage.',
      type: 'SCHOLARSHIP',
      eligibility: 'Class 8 students studying in government/aided schools scoring 55%+ marks and parental income not exceeding Rs. 3.5 Lakh/year.',
      benefits: 'Rs. 12,000 per annum (Rs. 1,000 per month) for 4 years from Class 9 to Class 12.',
      documents: ['Class 7 Marksheet', 'Income Certificate', 'SC/ST Certificate (if applicable)', 'Bank Account details'],
      amount: 'Rs. 12,000 per year',
      applicationUrl: 'https://scholarships.gov.in/',
      issuedBy: 'Department of School Education & Literacy, Ministry of Education',
    },
    {
      title: 'Skill India Digital Hub & PMKVY Schemes',
      description: 'Flagship national skill certification scheme enabling Indian youth to take up industry-relevant skill training that helps secure a better livelihood.',
      type: 'GOVERNMENT_SCHEME',
      eligibility: 'Any Indian citizen aged 15-45 looking for employment or skill enhancement. No formal prior educational degree required.',
      benefits: '100% free technical skill training, Government of India certificate, monetary reward, and direct placement support.',
      documents: ['Aadhaar Card', 'Bank Account details', 'Education certificates (if any)'],
      amount: 'Free Training + Certification + Stipend',
      applicationUrl: 'https://www.skillindiadigital.gov.in/',
      issuedBy: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    },
    {
      title: 'AICTE Pragati & Saksham Scholarship Scheme',
      description: 'All India Council for Technical Education scheme aimed at providing assistance for advancement of girls pursuing technical education (Degree & Diploma).',
      type: 'SCHOLARSHIP',
      eligibility: 'Girl students admitted to 1st year of Degree/Diploma level course in an AICTE approved institution. Max 2 girls per family.',
      benefits: 'Rs. 50,000 per annum for every year of study towards college fee, computer purchase, and books.',
      documents: ['Admission letter to AICTE institute', '10th & 12th marksheets', 'Income certificate (< 8 Lakh/yr)', 'Aadhaar Card'],
      amount: 'Rs. 50,000 per year',
      applicationUrl: 'https://www.aicte-india.org/schemes/students-development-schemes',
      issuedBy: 'All India Council for Technical Education (AICTE)',
    },
    {
      title: 'Vidyasaarathi Education Scholarship Portal (NSDL)',
      description: 'Transparent scholarship gateway managed by NSDL e-Governance for students from low-income families looking for higher education corporate scholarships.',
      type: 'SCHOLARSHIP',
      eligibility: 'Students pursuing ITI, Polytechnic, Undergraduate or Professional courses with family income below Rs. 5 Lakh.',
      benefits: 'Direct Bank Transfer (DBT) tuition grants up to Rs. 40,000 per year.',
      documents: ['Fee receipt', 'College bonafide certificate', 'Income proof', 'Bank passbook'],
      amount: 'Rs. 20,000 – 40,000 / year',
      applicationUrl: 'https://www.vidyasaarathi.co.in/',
      issuedBy: 'NSDL e-Governance Infrastructure',
    },
  ];

  for (const scheme of schemes) {
    await prisma.scheme.create({ data: scheme });
  }
  console.log(`✅ ${schemes.length} verified schemes/scholarships created`);

  // ── Clear & Re-seed Jobs with Live Working Platforms ────────────────────────
  await prisma.job.deleteMany({});

  const jobs = [
    {
      title: 'Student Internships – Internshala Portal',
      organization: 'Internshala (Official Partner Portal)',
      description: 'Explore over 10,000+ verified remote and in-office internships across India in Web Development, Graphic Design, Content Writing, Digital Marketing, and Teaching.',
      type: 'INTERNSHIP',
      eligibility: 'Open to all students, graduates, and high school learners. No prior work experience needed.',
      location: 'Pan India / 100% Work From Home',
      stipend: 'Rs. 5,000 – 25,000 / month',
      applicationUrl: 'https://internshala.com/internships/',
      tags: ['internshala', 'internship', 'remote', 'students', 'all-streams'],
    },
    {
      title: 'AICTE National Internship Portal Opportunities',
      organization: 'AICTE & Ministry of Education',
      description: 'Official Government of India portal connecting engineering, diploma, and polytechnic students with public sector units, smart cities, and private enterprises.',
      type: 'INTERNSHIP',
      eligibility: 'Students currently enrolled in recognized colleges or institutes across India.',
      location: 'Pan India (Urban & Rural Districts)',
      stipend: 'Rs. 8,000 – 15,000 / month',
      applicationUrl: 'https://internship.aicte-india.org/',
      tags: ['aicte', 'government', 'technology', 'engineering'],
    },
    {
      title: 'National Career Service (NCS) – Youth Job Portal',
      organization: 'Ministry of Labour & Employment',
      description: 'A Mission Mode Project by the Ministry of Labour and Employment providing job matching, vocational guidance, and skill development programs.',
      type: 'FULL_TIME',
      eligibility: '10th Pass, 12th Pass, ITI, Diploma holders and Graduates across all disciplines.',
      location: 'All Indian States & Districts',
      salary: 'Rs. 15,000 – 35,000 / month',
      applicationUrl: 'https://www.ncs.gov.in/',
      tags: ['government', 'ncs', 'entry-level', 'freshers'],
    },
    {
      title: 'Teach For India – Educational Fellowship',
      organization: 'Teach For India',
      description: 'Two-year leadership development program where you teach underprivileged children full-time and advocate for educational equity across India.',
      type: 'FULL_TIME',
      eligibility: 'Graduates or graduating students with strong communication skills and passion for teaching.',
      location: 'Mumbai, Delhi, Pune, Bangalore, Hyderabad, Chennai, Ahmedabad',
      salary: 'Rs. 23,000 / month + Housing Allowance',
      applicationUrl: 'https://apply.teachforindia.org/',
      tags: ['education', 'teaching', 'fellowship', 'social-impact'],
    },
    {
      title: 'MyGov Innovation & Digital Volunteering Internships',
      organization: 'MyGov India',
      description: 'Engage directly with the Government of India on public policy, social media, research, and citizen empowerment initiatives.',
      type: 'INTERNSHIP',
      eligibility: 'Enrolled undergraduate or postgraduate students with interest in digital governance.',
      location: 'New Delhi / Remote',
      stipend: 'Rs. 10,000 / month + Certificate of Excellence',
      applicationUrl: 'https://innovateindia.mygov.in/',
      tags: ['mygov', 'digital-india', 'governance', 'research'],
    },
    {
      title: 'Indeed India – Entry-Level & Fresher Jobs',
      organization: 'Indeed India Network',
      description: 'Search hundreds of thousands of entry-level openings in customer support, IT operations, data entry, teaching, and logistics.',
      type: 'FULL_TIME',
      eligibility: '12th Pass, Diploma, or Graduate.',
      location: 'Pan India / Remote',
      salary: 'Rs. 1.8 – 4.5 LPA',
      applicationUrl: 'https://in.indeed.com/jobs?q=entry+level+fresher',
      tags: ['indeed', 'fresher', 'entry-level', 'corporate'],
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`✅ ${jobs.length} verified jobs/internships created`);

  // ── Seed Quizzes ───────────────────────────────────────────────────────────
  await prisma.quizAttempt.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.quiz.deleteMany({});

  await prisma.quiz.create({
    data: {
      title: 'Mathematics Basics & Quantitative Aptitude',
      description: 'Test your basic arithmetic, algebra, geometry, and speed calculations.',
      subject: 'Mathematics',
      topic: 'Basics & Arithmetic',
      duration: 15,
      totalMarks: 5,
      questions: {
        create: [
          {
            questionText: 'What is the value of x in the equation 2x + 6 = 14?',
            optionA: '3', optionB: '4', optionC: '5', optionD: '6',
            correctOption: 'B',
            explanation: '2x + 6 = 14 → 2x = 8 → x = 4',
            marks: 1, order: 1,
          },
          {
            questionText: 'What is the area of a circle with radius 7 cm? (Use π = 22/7)',
            optionA: '144 cm²', optionB: '154 cm²', optionC: '164 cm²', optionD: '174 cm²',
            correctOption: 'B',
            explanation: 'Area = πr² = (22/7) × 7 × 7 = 154 cm²',
            marks: 1, order: 2,
          },
          {
            questionText: 'What is the HCF (Highest Common Factor) of 36 and 48?',
            optionA: '6', optionB: '8', optionC: '12', optionD: '18',
            correctOption: 'C',
            explanation: 'Factors of 36: 1,2,3,4,6,9,12,18,36. Factors of 48: 1,2,3,4,6,8,12,16,24,48. Highest common factor = 12.',
            marks: 1, order: 3,
          },
          {
            questionText: 'If a train travels 360 km in 4 hours, what is its speed in km/h?',
            optionA: '80 km/h', optionB: '90 km/h', optionC: '100 km/h', optionD: '120 km/h',
            correctOption: 'B',
            explanation: 'Speed = Distance / Time = 360 / 4 = 90 km/h.',
            marks: 1, order: 4,
          },
          {
            questionText: 'What is 15% of 200?',
            optionA: '25', optionB: '30', optionC: '35', optionD: '40',
            correctOption: 'B',
            explanation: '15% of 200 = (15 / 100) × 200 = 30.',
            marks: 1, order: 5,
          },
        ],
      },
    },
  });

  await prisma.quiz.create({
    data: {
      title: 'General Science & Environment Quiz',
      description: 'Fundamental questions in Physics, Chemistry, Biology, and Environmental Science.',
      subject: 'Science',
      topic: 'General Science',
      duration: 20,
      totalMarks: 5,
      questions: {
        create: [
          {
            questionText: 'What is the SI unit of force?',
            optionA: 'Joule', optionB: 'Newton', optionC: 'Watt', optionD: 'Pascal',
            correctOption: 'B',
            explanation: 'Force is measured in Newtons (N) in the SI system (F = m × a).',
            marks: 1, order: 1,
          },
          {
            questionText: 'Which gas is most abundant in Earth\'s atmosphere?',
            optionA: 'Oxygen', optionB: 'Carbon Dioxide', optionC: 'Nitrogen', optionD: 'Argon',
            correctOption: 'C',
            explanation: 'Nitrogen (N₂) makes up approximately 78% of Earth\'s atmosphere.',
            marks: 1, order: 2,
          },
          {
            questionText: 'What is the chemical formula of water?',
            optionA: 'H₂O₂', optionB: 'HO', optionC: 'H₂O', optionD: 'H₃O',
            correctOption: 'C',
            explanation: 'Water is formed of two hydrogen atoms and one oxygen atom (H₂O).',
            marks: 1, order: 3,
          },
          {
            questionText: 'Which organ pumps blood throughout the human body?',
            optionA: 'Lungs', optionB: 'Kidney', optionC: 'Liver', optionD: 'Heart',
            correctOption: 'D',
            explanation: 'The heart is the muscular pump of the cardiovascular system.',
            marks: 1, order: 4,
          },
          {
            questionText: 'What is the speed of light in vacuum?',
            optionA: '3 × 10⁶ m/s', optionB: '3 × 10⁸ m/s', optionC: '3 × 10¹⁰ m/s', optionD: '3 × 10⁴ m/s',
            correctOption: 'B',
            explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ m/s (~300,000 km/s).',
            marks: 1, order: 5,
          },
        ],
      },
    },
  });

  console.log('✅ 2 quizzes with full questions created');
  console.log('\n🎉 Database re-seeded with live, verified content successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
