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
  console.log('🌱 Seeding RuralConnect database with complete Smart Education features (Govt of Kerala alignment)...');

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
          designation: 'Senior Software Engineer & Tech Educator',
          organization: 'Tata Consultancy Services',
          bio: 'Passionate about bridging the digital divide for rural youth through hands-on coding, computer basics, and communication mentoring.',
          expertise: ['JavaScript', 'Python', 'Digital Skills', 'Career Mentorship'],
          subjects: ['Computer Science', 'Mathematics'],
          qualifications: ['B.Tech - IIT Delhi', 'M.Tech - BITS Pilani'],
          experience: 8,
          location: 'Kochi / Remote',
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
          designation: 'Research Scientist & Science Educator',
          organization: 'National Institute of Technology (NIT)',
          bio: 'Dedicated to fostering research and development mindset among rural students. Guides science projects, scientific method, and competitive exams.',
          expertise: ['Physics', 'Research & Development', 'Scientific Method', 'Chemistry'],
          subjects: ['Physics', 'Chemistry', 'Science'],
          qualifications: ['M.Sc Physics', 'PhD - IISc Bangalore'],
          experience: 12,
          location: 'Thiruvananthapuram / Remote',
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
          designation: 'Communication Coach & Language Trainer',
          organization: 'Kerala English Language Initiative',
          bio: 'Specialist in elevating communication skills, public speaking confidence, and professional English for rural learners.',
          expertise: ['Spoken English', 'Communication Skills', 'Interview Preparation', 'Soft Skills'],
          subjects: ['English', 'Communication'],
          qualifications: ['M.A. English - Kerala University', 'TESOL Certified'],
          experience: 10,
          location: 'Kozhikode / Remote',
          isAvailable: true,
        },
      },
    },
  });

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
          village: 'Wayanad Rural',
          district: 'Wayanad',
          state: 'Kerala',
          class: '12th',
          school: 'Govt. Higher Secondary School',
          board: 'Kerala State Board',
          interests: ['Science', 'Technology', 'Communication', 'Mathematics'],
          bio: 'First-generation rural student aspiring for higher technical education and scientific research.',
        },
      },
    },
  });

  // ── Educational & Material Resources ────────────────────────────────────────
  await prisma.bookmark.deleteMany({});
  await prisma.completedResource.deleteMany({});
  await prisma.resource.deleteMany({});

  const resources = [
    // 1. Digital Literacy & Computer Basics (Bridge the digital divide)
    {
      title: 'Digital Literacy & Computer Basics Tutorial',
      description: 'Comprehensive guide covering computer hardware, mouse and keyboard operations, file management, internet surfing, and cyber safety for first-time digital users.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Digital Literacy',
      url: 'https://www.youtube.com/watch?v=x3c1IH2NJEg',
      difficulty: 'BEGINNER',
      tags: ['digital-divide', 'computer-basics', 'literacy', 'internet-safety'],
    },
    // 2. Communication Skills & Spoken English (Elevate communication skills)
    {
      title: 'Spoken English & Communication Skills Masterclass',
      description: 'Practical course focused on everyday conversation skills, sentence structure, pronunciation, and building confidence in public speaking for rural students.',
      type: 'VIDEO',
      subject: 'English',
      topic: 'Communication Skills',
      url: 'https://www.youtube.com/watch?v=juKd26QKNAw',
      difficulty: 'BEGINNER',
      tags: ['communication', 'spoken-english', 'confidence', 'soft-skills'],
    },
    // 3. Programming & High-Demand Technology
    {
      title: 'Python for Beginners – Full Free Course',
      description: 'World-renowned beginner Python programming course by freeCodeCamp. Teaches programming logic, loops, functions, and real-world projects.',
      type: 'VIDEO',
      subject: 'Computer Science',
      topic: 'Python Programming',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      difficulty: 'BEGINNER',
      tags: ['python', 'programming', 'software', 'coding'],
    },
    // 4. Research & Development / Interactive Lab Simulations
    {
      title: 'PhET Interactive STEM Science & Math Simulations',
      description: 'Award-winning interactive simulation laboratory from the University of Colorado. Enables students to experiment with physics, chemistry, and biology virtual experiments free.',
      type: 'ARTICLE',
      subject: 'Science',
      topic: 'Research & Lab Simulations',
      url: 'https://phet.colorado.edu/',
      difficulty: 'BEGINNER',
      tags: ['research', 'simulations', 'stem', 'virtual-lab'],
    },
    // 5. Access to Material Resources (National Digital Library)
    {
      title: 'National Digital Library of India (NDLI) – 5+ Crore Free Books',
      description: 'Ministry of Education flagship digital repository offering free full-text access to academic textbooks, research papers, audio books, and lecture notes across all languages.',
      type: 'ARTICLE',
      subject: 'General Education',
      topic: 'Material Resources',
      url: 'https://ndl.iitkgp.ac.in/',
      difficulty: 'BEGINNER',
      tags: ['material-resources', 'digital-library', 'free-books', 'ndli'],
    },
    // 6. NCERT Official Textbooks (Material Resources & Literacy)
    {
      title: 'NCERT Official Class 10 Science Textbook & Solutions',
      description: 'Official National Council of Educational Research and Training (NCERT) textbook covering Physics, Chemistry, and Biology fundamentals.',
      type: 'PDF',
      subject: 'Science',
      topic: 'NCERT Class 10 Science',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      difficulty: 'BEGINNER',
      tags: ['ncert', 'class10', 'science', 'literacy'],
    },
    // 7. Advanced Mathematics
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
    // 8. OpenStax College Physics Textbook
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
    // 9. SWAYAM Higher Education Free Courses
    {
      title: 'SWAYAM Government Free Online Courses (IIT & IIM Faculty)',
      description: 'Government of India digital learning platform providing certified higher education modules in science, humanities, and engineering from premier institutions.',
      type: 'ARTICLE',
      subject: 'General Education',
      topic: 'Higher Education',
      url: 'https://swayam.gov.in/',
      difficulty: 'INTERMEDIATE',
      tags: ['swayam', 'government', 'iit', 'higher-education'],
    },
    // 10. Research Lectures: NPTEL
    {
      title: 'NPTEL Advanced Video Lectures & Research Preparation',
      description: 'Joint initiative of the IITs and IISc offering high-quality video courses in STEM and engineering to foster research and development in underserved areas.',
      type: 'VIDEO',
      subject: 'Science',
      topic: 'Research & Advanced STEM',
      url: 'https://nptel.ac.in/',
      difficulty: 'ADVANCED',
      tags: ['research', 'nptel', 'iit', 'stem', 'development'],
    },
  ];

  for (const resource of resources) {
    await prisma.resource.create({ data: resource });
  }
  console.log(`✅ ${resources.length} verified learning & material resources created`);

  // ── Grants, Loans, Incentives & Connectivity Support ────────────────────────
  await prisma.scheme.deleteMany({});

  const schemes = [
    // 1. Digital Connectivity Support (Govt of Kerala & National)
    {
      title: 'KFON (Kerala Fibre Optic Network) – Free Internet for Disadvantaged Families',
      description: 'Pioneering Government of Kerala flagship initiative declaring internet access as a basic human right. Provides high-speed optical fibre connectivity completely free of cost to 20+ lakh economically disadvantaged rural families and 30,000+ government educational institutions.',
      type: 'CONNECTIVITY_GRANT',
      eligibility: 'BPL (Below Poverty Line) households, government school students, and rural residents across all Kerala districts.',
      benefits: 'Free high-speed broadband connection + subsidised digital equipment.',
      documents: ['Ration Card (BPL category)', 'Aadhaar Card', 'Address Proof'],
      amount: '100% Free Internet Access',
      applicationUrl: 'https://kfon.kerala.gov.in/',
      issuedBy: 'Government of Kerala (IT Infrastructure & KSEB)',
    },
    // 2. Educational Loans & Subsidies
    {
      title: 'Vidya Lakshmi Portal – National Education Loan & Subsidy Portal',
      description: 'First-of-its-kind digital portal developed by NSDL e-Gov under Department of Financial Services. Enables students from humble backgrounds to view, apply, and track education loans and interest subsidies from 40+ national banks under a single application.',
      type: 'EDUCATION_LOAN',
      eligibility: 'Indian students admitted to higher education or professional courses in recognized institutions in India or abroad.',
      benefits: 'Educational loans up to Rs. 7.5 Lakh without collateral. Concessional interest rates and moratoria during course duration.',
      documents: ['Admission Proof / Fee Structure', '10th/12th Marksheets', 'Income Certificate', 'PAN & Aadhaar Card'],
      amount: 'Up to Rs. 7.5 – 15 Lakh',
      applicationUrl: 'https://www.vidyalakshmi.co.in/',
      issuedBy: 'Ministry of Finance & Ministry of Education, Govt of India',
    },
    // 3. Interest Subsidy on Education Loans (CSIS)
    {
      title: 'Central Sector Interest Subsidy Scheme (CSIS) on Education Loans',
      description: 'Full interest subsidy during the moratorium period on education loans taken by students belonging to Economically Weaker Sections (EWS) pursuing approved professional courses.',
      type: 'INCENTIVE',
      eligibility: 'Students with parental annual income from all sources not exceeding Rs. 4.5 Lakh.',
      benefits: '100% government reimbursement of the interest accrued during the course period + 1 year.',
      documents: ['Income Certificate issued by authorized State authority', 'Loan sanction letter from scheduled bank'],
      amount: 'Full Interest Waiver during Study',
      applicationUrl: 'https://www.education.gov.in/technical-education-1',
      issuedBy: 'Ministry of Education, Government of India',
    },
    // 4. National Scholarship Portal (NSP)
    {
      title: 'National Scholarship Portal (NSP) – Central & State Schemes',
      description: 'Unified electronic portal providing access to pre-matric, post-matric, and merit-cum-means scholarships for rural and underserved students.',
      type: 'SCHOLARSHIP',
      eligibility: 'School and college students with family annual income under Rs. 2.5 Lakh. Merit and means criteria apply.',
      benefits: 'Direct DBT payment into student bank account for tuition fees, books, and living maintenance.',
      documents: ['Aadhaar Card', 'Income Certificate', 'Academic Marksheet', 'Bank Passbook'],
      amount: 'Rs. 12,000 – 50,000 / year',
      applicationUrl: 'https://scholarships.gov.in/',
      issuedBy: 'Ministry of Education & MeitY, Govt of India',
    },
    // 5. Research & Innovation Grant (MANAK)
    {
      title: 'INSPIRE Awards – MANAK (Million Minds Augmenting National Aspiration & Knowledge)',
      description: 'Department of Science & Technology (DST) initiative to motivate students in rural and urban schools to foster a culture of creative thinking and innovative research in science.',
      type: 'INCENTIVE',
      eligibility: 'Students of Classes 6 to 10 aged 10-15 years submitting original scientific prototypes or ideas.',
      benefits: 'Rs. 10,000 one-time grant for prototype development + mentorship by science researchers at state/national exhibitions.',
      documents: ['School Principal recommendation', 'Scientific project synopsis', 'Aadhaar Card'],
      amount: 'Rs. 10,000 Innovation Grant',
      applicationUrl: 'https://www.inspireawards-dst.gov.in/',
      issuedBy: 'Department of Science and Technology (DST), Govt of India',
    },
    // 6. Skill India & Free Vocational Training
    {
      title: 'Skill India Digital Hub & PMKVY Schemes',
      description: 'Nationwide skill certification initiative providing free short-duration vocational training programs across digital, technical, and agricultural sectors.',
      type: 'GOVERNMENT_SCHEME',
      eligibility: 'Indian citizen aged 15-45 looking for employment or skill enhancement. No formal degree required.',
      benefits: 'Free skill training, government certification, monetary award, and direct industry placement assistance.',
      documents: ['Aadhaar Card', 'Bank Account details', 'Age proof'],
      amount: 'Free Certification + Placement',
      applicationUrl: 'https://www.skillindiadigital.gov.in/',
      issuedBy: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    },
  ];

  for (const scheme of schemes) {
    await prisma.scheme.create({ data: scheme });
  }
  console.log(`✅ ${schemes.length} verified grants, loans, connectivity & schemes created`);

  // ── Employment & Internship Opportunities ──────────────────────────────────
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

  // ── Quizzes ─────────────────────────────────────────────────────────────────
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
  console.log('\n🎉 Database re-seeded with comprehensive Smart Education & Kerala aligned data!');
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
