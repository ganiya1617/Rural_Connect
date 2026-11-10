'use strict';

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding RuralConnect database...');

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

  // ── Sample Mentor ───────────────────────────────────────────────────────────
  const mentorPass = await bcrypt.hash('Mentor@1234', BCRYPT_ROUNDS);
  const mentor = await prisma.user.upsert({
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
          organization: 'TCS',
          bio: 'Passionate about empowering rural students through technology education. 8+ years experience in software development.',
          expertise: ['JavaScript', 'Python', 'Web Development', 'Data Structures'],
          subjects: ['Computer Science', 'Mathematics'],
          qualifications: ['B.Tech - IIT Delhi', 'M.Tech - BITS Pilani'],
          experience: 8,
          location: 'Bangalore',
          isAvailable: true,
        },
      },
    },
  });

  const mentor2Pass = await bcrypt.hash('Mentor@1234', BCRYPT_ROUNDS);
  await prisma.user.upsert({
    where: { email: 'rajesh.kumar@ruralconnect.in' },
    update: {},
    create: {
      email: 'rajesh.kumar@ruralconnect.in',
      password: mentor2Pass,
      name: 'Rajesh Kumar',
      role: 'MENTOR',
      mentorProfile: {
        create: {
          designation: 'Science Teacher & Researcher',
          organization: 'Delhi University',
          bio: 'Dedicated educator with 12 years of teaching Physics and Chemistry to rural students across India.',
          expertise: ['Physics', 'Chemistry', 'Research Methodology'],
          subjects: ['Physics', 'Chemistry', 'Science'],
          qualifications: ['M.Sc Physics - Delhi University', 'PhD - IISc Bangalore'],
          experience: 12,
          location: 'Delhi',
          isAvailable: true,
        },
      },
    },
  });
  console.log('✅ Sample mentors created');

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

  // ── Resources ───────────────────────────────────────────────────────────────
  const resources = [
    {
      title: 'Introduction to Python Programming',
      description: 'A comprehensive beginner guide to Python programming covering basics, data types, loops and functions.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Python Basics',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      difficulty: 'BEGINNER',
      tags: ['python', 'programming', 'beginner'],
    },
    {
      title: 'Class 10 Science NCERT Solutions',
      description: 'Complete NCERT solutions for Class 10 Science including Physics, Chemistry and Biology.',
      type: 'PDF',
      subject: 'Science',
      topic: 'NCERT Solutions',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      difficulty: 'BEGINNER',
      tags: ['ncert', 'class10', 'science'],
    },
    {
      title: 'Mathematics Class 12 - Calculus',
      description: 'Deep dive into calculus including limits, derivatives and integrals for Class 12 students.',
      type: 'VIDEO',
      subject: 'Mathematics',
      topic: 'Calculus',
      url: 'https://www.youtube.com/watch?v=WUvTyaaNkzM',
      difficulty: 'INTERMEDIATE',
      tags: ['calculus', 'maths', 'class12'],
    },
    {
      title: 'English Grammar - Complete Guide',
      description: 'Master English grammar from basics to advanced level. Covers tenses, voices, narration and more.',
      type: 'ARTICLE',
      subject: 'English',
      topic: 'Grammar',
      url: 'https://www.grammarly.com/blog/grammar/',
      difficulty: 'BEGINNER',
      tags: ['english', 'grammar', 'communication'],
    },
    {
      title: 'Indian History for UPSC Preparation',
      description: 'Detailed notes on Indian History from ancient to modern era, ideal for competitive exams.',
      type: 'PDF',
      subject: 'History',
      topic: 'Indian History',
      url: 'https://www.insightsonindia.com/indian-history/',
      difficulty: 'INTERMEDIATE',
      tags: ['history', 'upsc', 'competitive'],
    },
    {
      title: 'Digital Literacy for Rural Students',
      description: 'Introduction to computers, internet, email and essential digital skills for rural learners.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Digital Literacy',
      url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
      difficulty: 'BEGINNER',
      tags: ['digital', 'computer', 'internet', 'beginner'],
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log(`✅ ${resources.length} learning resources created`);

  // ── Schemes / Scholarships ──────────────────────────────────────────────────
  const schemes = [
    {
      title: 'PM Scholarship Scheme for Central Armed Police Forces',
      description: 'Scholarship for wards of Central Armed Police Forces and Railway Protection Force for professional degree courses.',
      type: 'SCHOLARSHIP',
      eligibility: 'Ward of CAPF/RPF personnel. Minimum 60% in Class 12.',
      benefits: 'Rs. 2,000/month for boys, Rs. 2,250/month for girls',
      documents: ['Marksheet', 'Service certificate of parent', 'Bank account details', 'Aadhar card'],
      amount: 'Rs. 24,000 - 27,000 per year',
      applicationUrl: 'https://ksb.gov.in/',
      issuedBy: 'Kendriya Sainik Board, Ministry of Defence',
    },
    {
      title: 'National Means-cum-Merit Scholarship (NMMS)',
      description: 'State-level scholarship for meritorious students from economically weaker sections to continue studies in Class 9-12.',
      type: 'SCHOLARSHIP',
      eligibility: 'Students of Class 8 with minimum 55% marks. Family income below Rs. 1.5 lakh per year.',
      benefits: 'Rs. 12,000 per year (Rs. 1,000/month)',
      documents: ['Income certificate', 'Class 7 marksheet', 'Caste certificate', 'Bank passbook'],
      amount: 'Rs. 12,000 per year',
      applicationUrl: 'https://scholarships.gov.in/',
      issuedBy: 'Ministry of Education, Government of India',
    },
    {
      title: 'Post Matric Scholarship for SC Students',
      description: 'Government scholarship for Scheduled Caste students pursuing post-matriculation or post-secondary education.',
      type: 'SCHOLARSHIP',
      eligibility: 'Belongs to Scheduled Caste. Studying in a government-recognized institution post Class 10.',
      benefits: 'Full tuition fee + maintenance allowance',
      documents: ['Caste certificate', 'Income certificate', 'Marksheets', 'Institution bonafide certificate'],
      amount: 'Variable based on course',
      applicationUrl: 'https://scholarships.gov.in/',
      issuedBy: 'Ministry of Social Justice and Empowerment',
    },
    {
      title: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY)',
      description: 'Flagship scheme for skill development offering free short-duration skill training programs across India.',
      type: 'GOVERNMENT_SCHEME',
      eligibility: 'Indian citizen, age 15-45 years, school dropout or unemployed youth.',
      benefits: 'Free skill training, certification, placement assistance and monetary reward',
      documents: ['Aadhar card', 'Bank account', 'Age proof'],
      applicationUrl: 'https://www.pmkvyofficial.org/',
      issuedBy: 'Ministry of Skill Development and Entrepreneurship',
    },
    {
      title: 'Beti Bachao Beti Padhao Scheme',
      description: 'Government initiative to ensure welfare and education of the girl child across India.',
      type: 'GOVERNMENT_SCHEME',
      eligibility: 'Girl students across India, with focus on districts with low sex ratio.',
      benefits: 'Educational support, awareness programs, financial incentives for girls education',
      documents: ['Birth certificate', 'Aadhar card', 'School enrollment proof'],
      applicationUrl: 'https://wcd.nic.in/bbbp-schemes',
      issuedBy: 'Ministry of Women and Child Development',
    },
  ];

  for (const scheme of schemes) {
    await prisma.scheme.create({ data: scheme });
  }
  console.log(`✅ ${schemes.length} schemes/scholarships created`);

  // ── Jobs / Internships ──────────────────────────────────────────────────────
  const jobs = [
    {
      title: 'Digital India Internship',
      organization: 'Ministry of Electronics and Information Technology',
      description: 'Summer internship opportunity at MeitY working on digital India initiatives and e-governance projects.',
      type: 'INTERNSHIP',
      eligibility: 'Students pursuing B.Tech/MCA/BCA in final or pre-final year',
      location: 'New Delhi',
      stipend: 'Rs. 10,000/month',
      applicationUrl: 'https://internship.aicte-india.org/',
      tags: ['government', 'technology', 'digital-india'],
    },
    {
      title: 'Rural Development Intern',
      organization: 'NABARD',
      description: 'Work with rural communities on agricultural finance, microfinance and self-help group initiatives.',
      type: 'INTERNSHIP',
      eligibility: 'Students of Agriculture, Rural Development, Economics or MBA (Agri)',
      location: 'Pan India',
      stipend: 'Rs. 15,000/month',
      applicationUrl: 'https://www.nabard.org/',
      tags: ['rural', 'agriculture', 'finance', 'development'],
    },
    {
      title: 'Junior Software Developer',
      organization: 'Zoho Corporation',
      description: 'Entry-level software development position building enterprise SaaS products for global customers.',
      type: 'FULL_TIME',
      eligibility: 'B.Tech/BE in CS or IT with minimum 60% marks. Strong problem-solving skills.',
      location: 'Chennai / Remote',
      salary: 'Rs. 5-8 LPA',
      applicationUrl: 'https://careers.zohocorp.com/',
      tags: ['software', 'developer', 'entry-level', 'it'],
    },
    {
      title: 'Primary School Teacher',
      organization: 'Teach For India',
      description: 'Two-year fellowship teaching underprivileged children in government schools across metro cities.',
      type: 'FULL_TIME',
      eligibility: 'Graduate in any discipline with minimum 50% marks. Passionate about education.',
      location: 'Mumbai, Delhi, Bangalore, Pune',
      salary: 'Rs. 17,000 - 23,000/month (stipend)',
      applicationUrl: 'https://www.teachforindia.org/apply',
      tags: ['education', 'teaching', 'fellowship', 'ngo'],
    },
    {
      title: 'Content Creator - Rural Education',
      organization: 'Khan Academy India',
      description: 'Create educational content in regional Indian languages for Maths and Science up to Class 10.',
      type: 'PART_TIME',
      eligibility: 'Graduate with strong subject knowledge. Experience in content creation preferred.',
      location: 'Remote',
      salary: 'Project-based (Rs. 500-1000 per video)',
      applicationUrl: 'https://khanacademy.org/careers',
      tags: ['education', 'content', 'remote', 'part-time'],
    },
  ];

  for (const job of jobs) {
    await prisma.job.create({ data: job });
  }
  console.log(`✅ ${jobs.length} jobs/internships created`);

  // ── Quizzes ─────────────────────────────────────────────────────────────────
  const mathQuiz = await prisma.quiz.create({
    data: {
      title: 'Mathematics Basics',
      description: 'Test your basic mathematics knowledge covering algebra, arithmetic and geometry.',
      subject: 'Mathematics',
      topic: 'Basics',
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
            questionText: 'What is the HCF of 36 and 48?',
            optionA: '6', optionB: '8', optionC: '12', optionD: '18',
            correctOption: 'C',
            explanation: 'Factors of 36: 1,2,3,4,6,9,12,18,36. Factors of 48: 1,2,3,4,6,8,12,16,24,48. HCF = 12',
            marks: 1, order: 3,
          },
          {
            questionText: 'If a train travels 360 km in 4 hours, what is its speed?',
            optionA: '80 km/h', optionB: '90 km/h', optionC: '100 km/h', optionD: '120 km/h',
            correctOption: 'B',
            explanation: 'Speed = Distance/Time = 360/4 = 90 km/h',
            marks: 1, order: 4,
          },
          {
            questionText: 'What is 15% of 200?',
            optionA: '25', optionB: '30', optionC: '35', optionD: '40',
            correctOption: 'B',
            explanation: '15% of 200 = (15/100) × 200 = 30',
            marks: 1, order: 5,
          },
        ],
      },
    },
  });

  const scienceQuiz = await prisma.quiz.create({
    data: {
      title: 'General Science Quiz',
      description: 'Basic questions covering Physics, Chemistry and Biology for Class 9-10.',
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
            explanation: 'Force is measured in Newtons (N) in the SI system.',
            marks: 1, order: 1,
          },
          {
            questionText: 'Which gas is most abundant in Earth\'s atmosphere?',
            optionA: 'Oxygen', optionB: 'Carbon Dioxide', optionC: 'Nitrogen', optionD: 'Argon',
            correctOption: 'C',
            explanation: 'Nitrogen (N₂) makes up about 78% of Earth\'s atmosphere.',
            marks: 1, order: 2,
          },
          {
            questionText: 'What is the chemical formula of water?',
            optionA: 'H₂O₂', optionB: 'HO', optionC: 'H₂O', optionD: 'H₃O',
            correctOption: 'C',
            explanation: 'Water consists of 2 hydrogen atoms and 1 oxygen atom: H₂O.',
            marks: 1, order: 3,
          },
          {
            questionText: 'Which organ pumps blood throughout the human body?',
            optionA: 'Lungs', optionB: 'Kidney', optionC: 'Liver', optionD: 'Heart',
            correctOption: 'D',
            explanation: 'The heart pumps blood through the circulatory system.',
            marks: 1, order: 4,
          },
          {
            questionText: 'What is the speed of light in vacuum?',
            optionA: '3 × 10⁶ m/s', optionB: '3 × 10⁸ m/s', optionC: '3 × 10¹⁰ m/s', optionD: '3 × 10⁴ m/s',
            correctOption: 'B',
            explanation: 'Speed of light in vacuum = 3 × 10⁸ m/s (approximately 300,000 km/s).',
            marks: 1, order: 5,
          },
        ],
      },
    },
  });

  console.log(`✅ ${2} quizzes with questions created`);
  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:   admin@ruralconnect.in / Admin@1234');
  console.log('   Mentor:  priya.sharma@ruralconnect.in / Mentor@1234');
  console.log('   Student: arjun.patel@example.com / Student@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

