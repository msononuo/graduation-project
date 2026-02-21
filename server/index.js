import 'dotenv/config';
import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/Graduation%20Project',
  connectionTimeoutMillis: 5000,
});

const ALLOWED_DOMAINS = ['@stu.najah.edu', '@najah.edu'];

function isValidNajahEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_DOMAINS.some((d) => normalized.endsWith(d.toLowerCase()));
}

async function ensureSchema() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS app_users (
        id          SERIAL PRIMARY KEY,
        email       VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role        VARCHAR(50) NOT NULL DEFAULT 'student',
        created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    const cols = [
      { name: 'first_name',            def: 'VARCHAR(100)' },
      { name: 'middle_name',           def: 'VARCHAR(100)' },
      { name: 'last_name',             def: 'VARCHAR(100)' },
      { name: 'student_number',        def: 'VARCHAR(50) UNIQUE' },
      { name: 'college',               def: 'VARCHAR(200)' },
      { name: 'major',                 def: 'VARCHAR(200)' },
      { name: 'phone',                 def: 'VARCHAR(30)' },
      { name: 'must_change_password',  def: 'BOOLEAN NOT NULL DEFAULT FALSE' },
      { name: 'must_complete_profile', def: 'BOOLEAN NOT NULL DEFAULT FALSE' },
    ];
    for (const { name, def } of cols) {
      await client.query(`ALTER TABLE app_users ADD COLUMN IF NOT EXISTS ${name} ${def}`);
    }
    await client.query("UPDATE app_users SET role = 'student' WHERE role = 'user'");
    // Colleges and academic programs
    await client.query(`
      CREATE TABLE IF NOT EXISTS colleges (
        id            SERIAL PRIMARY KEY,
        name          VARCHAR(255) NOT NULL,
        short_name    VARCHAR(100) NOT NULL,
        slug          VARCHAR(100) NOT NULL UNIQUE,
        tagline       VARCHAR(200),
        description   TEXT,
        badge_1_label VARCHAR(100),
        badge_1_icon  VARCHAR(20) DEFAULT 'check',
        badge_2_label VARCHAR(100),
        badge_2_icon  VARCHAR(20) DEFAULT 'users',
        stat_1        VARCHAR(100),
        stat_2        VARCHAR(100),
        stat_3        VARCHAR(100),
        stat_4        VARCHAR(100),
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_colleges_slug ON colleges (slug)`);
    await client.query(`
      CREATE TABLE IF NOT EXISTS academic_programs (
        id                SERIAL PRIMARY KEY,
        college_id        INTEGER NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
        name              VARCHAR(255) NOT NULL,
        slug              VARCHAR(100) NOT NULL,
        credits           INTEGER,
        duration          VARCHAR(50),
        description       TEXT,
        sort_order        INTEGER NOT NULL DEFAULT 0,
        department        VARCHAR(200),
        required_gpa      VARCHAR(50),
        high_school_track VARCHAR(100),
        degree_type       VARCHAR(50),
        about_text        TEXT,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (college_id, slug)
      )
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_academic_programs_college ON academic_programs (college_id)`);
    const optionalCols = [
      { table: 'colleges', name: 'image_url', def: 'VARCHAR(500)' },
      { table: 'academic_programs', name: 'image_url', def: 'VARCHAR(500)' },
      { table: 'academic_programs', name: 'degree_level', def: 'VARCHAR(50) DEFAULT \'UNDERGRADUATE\'' },
    ];
    for (const { table, name, def } of optionalCols) {
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${name} ${def}`);
    }
    console.log('Schema verified / updated.');
  } finally {
    client.release();
  }
}

async function seedCollegesIfEmpty() {
  const r = await pool.query('SELECT 1 FROM colleges LIMIT 1');
  if (r.rows.length > 0) return;
  const client = await pool.connect();
  try {
    const colleges = [
      { name: 'College of Engineering & Information Technology', short_name: 'Engineering & IT', slug: 'engineering-it', tagline: 'EXCELLENCE IN TECHNOLOGY', description: 'Empowering the next generation of innovators through rigorous academic programs, world-class research facilities, and industry-leading faculty expertise.', badge_1_label: 'ABET Accredited', badge_2_label: '4,500+ Students', stat_1: '98% EMPLOYMENT RATE', stat_2: '120+ RESEARCH LABS', stat_3: '50M ANNUAL FUNDING', stat_4: '15k ALUMNI NETWORK' },
      { name: 'College of Medicine', short_name: 'Medicine', slug: 'medicine', tagline: 'EXCELLENCE IN HEALTHCARE', description: 'Training the next generation of healthcare leaders with rigorous clinical education, research in medical and health sciences, and a commitment to community care.', badge_1_label: 'WFME Accredited', badge_2_label: '3,200+ Students', stat_1: '96% RESIDENCY MATCH', stat_2: '45+ CLINICAL SITES', stat_3: '32M RESEARCH GRANTS', stat_4: '12k ALUMNI' },
      { name: 'College of Arts & Sciences', short_name: 'Arts & Sciences', slug: 'arts-sciences', tagline: 'EXCELLENCE IN INQUIRY', description: 'Fostering critical thinking and creativity across humanities, natural sciences, and social sciences for a well-rounded education and engaged citizenship.', badge_1_label: 'Accredited', badge_2_label: '4,500+ Students', stat_1: '98% EMPLOYMENT RATE', stat_2: '120+ RESEARCH LABS', stat_3: '50M ANNUAL FUNDING', stat_4: '15k ALUMNI NETWORK' },
      { name: 'College of Business & Economics', short_name: 'Business & Economics', slug: 'business', tagline: 'EXCELLENCE IN LEADERSHIP', description: 'Preparing future leaders with strong foundations in business administration, economics, finance, and management for the global marketplace.', badge_1_label: 'Accredited', badge_2_label: '4,500+ Students', stat_1: '98% EMPLOYMENT RATE', stat_2: '120+ RESEARCH LABS', stat_3: '50M ANNUAL FUNDING', stat_4: '15k ALUMNI NETWORK' },
      { name: 'College of Law', short_name: 'Law', slug: 'law', tagline: 'EXCELLENCE IN JUSTICE', description: 'Upholding justice and the rule of law through excellence in legal education, scholarly research, and professional practice.', badge_1_label: 'Accredited', badge_2_label: '4,500+ Students', stat_1: '94% BAR PASS RATE', stat_2: '30+ LEGAL CLINICS', stat_3: '8M ANNUAL FUNDING', stat_4: '6k ALUMNI' },
      { name: 'College of Information Technology', short_name: 'Information Technology', slug: 'it', tagline: 'EXCELLENCE IN DIGITAL INNOVATION', description: 'Driving digital transformation with programs in computer science, software engineering, and information systems for industry and research.', badge_1_label: 'ABET Accredited', badge_2_label: '2,800+ Students', stat_1: '98% EMPLOYMENT RATE', stat_2: '120+ RESEARCH LABS', stat_3: '50M ANNUAL FUNDING', stat_4: '15k ALUMNI NETWORK' },
      { name: 'College of Education', short_name: 'Education', slug: 'education', tagline: 'EXCELLENCE IN TEACHING', description: 'Developing educators and researchers committed to excellence in teaching, curriculum design, and educational policy for schools and communities.', badge_1_label: 'Accredited', badge_2_label: '4,500+ Students', stat_1: '98% EMPLOYMENT RATE', stat_2: '120+ RESEARCH LABS', stat_3: '50M ANNUAL FUNDING', stat_4: '15k ALUMNI NETWORK' },
      { name: 'College of Pharmacy', short_name: 'Pharmacy', slug: 'pharmacy', tagline: 'EXCELLENCE IN PHARMACEUTICAL CARE', description: 'Advancing pharmaceutical sciences and patient care through research, clinical practice, and community engagement.', badge_1_label: 'Accredited', badge_2_label: '4,500+ Students', stat_1: '97% LICENSURE RATE', stat_2: '50+ AFFILIATE SITES', stat_3: '18M RESEARCH FUNDING', stat_4: '5k ALUMNI' },
    ];
    for (const c of colleges) {
      const r = await client.query(
        `INSERT INTO colleges (name, short_name, slug, tagline, description, badge_1_label, badge_2_label, stat_1, stat_2, stat_3, stat_4)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [c.name, c.short_name, c.slug, c.tagline || null, c.description || null, c.badge_1_label || null, c.badge_2_label || null, c.stat_1 || null, c.stat_2 || null, c.stat_3 || null, c.stat_4 || null]
      );
      const collegeId = r.rows[0].id;
      const programs = getSeedProgramsForCollege(collegeId, c.slug);
      for (let i = 0; i < programs.length; i++) {
        const p = programs[i];
        await client.query(
          `INSERT INTO academic_programs (college_id, name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [collegeId, p.name, p.slug, p.credits || null, p.duration || '4 Years', p.description || null, i, p.department || null, p.required_gpa || null, p.high_school_track || null, p.degree_type || 'B.Sc', p.about_text || p.description || null]
        );
      }
    }
    console.log('Colleges and academic programs seeded.');
  } finally {
    client.release();
  }
}

function getSeedProgramsForCollege(collegeId, slug) {
  const bySlug = {
    'engineering-it': [
      { name: 'Computer Science', slug: 'computer-science', credits: 132, duration: '4 Years', description: 'Study algorithms, software systems, and computational theory to solve complex problems.', department: 'Department of Computer Science', required_gpa: '85%', high_school_track: 'Scientific', degree_type: 'B.Sc', about_text: 'The Computer Science program provides a strong foundation in algorithms, programming, data structures, and software engineering.' },
      { name: 'Electrical Engineering', slug: 'electrical-engineering', credits: 158, duration: '4 Years', description: 'Design and analyze electrical systems, from microelectronics to power grids.' },
      { name: 'Civil Engineering', slug: 'civil-engineering', credits: 155, duration: '4 Years', description: 'Plan, design, and manage infrastructure that shapes our built environment.' },
      { name: 'Mechanical Engineering', slug: 'mechanical-engineering', credits: 160, duration: '4 Years', description: 'Apply principles of mechanics and thermodynamics to create machines and systems.' },
      { name: 'Information Technology', slug: 'information-technology', credits: 148, duration: '4 Years', description: 'Bridge business and technology with skills in systems, networks, and data.', department: 'Department of Information Technology', about_text: 'The Information Technology program bridges business and technology, focusing on systems administration, networking, and application development.' },
      { name: 'Software Engineering', slug: 'software-engineering', credits: 152, duration: '4 Years', description: 'Build reliable, scalable software through systematic design and development.' },
    ],
    medicine: [
      { name: 'Medicine', slug: 'medicine', credits: 252, duration: '6 Years', description: 'Comprehensive medical education combining basic sciences with clinical training and patient care.' },
      { name: 'Nursing', slug: 'nursing', credits: 132, duration: '4 Years', description: 'Prepare for roles in clinical practice, leadership, and community health.' },
      { name: 'Medical Lab Sciences', slug: 'medical-lab', credits: 128, duration: '4 Years', description: 'Laboratory medicine, diagnostics, and research methodologies.' },
    ],
    'arts-sciences': [
      { name: 'English Language', slug: 'english', credits: 124, duration: '4 Years', description: 'Literature, linguistics, and communication in the English language.' },
      { name: 'Mathematics', slug: 'mathematics', credits: 128, duration: '4 Years', description: 'Pure and applied mathematics, statistics, and mathematical modeling.' },
      { name: 'Physics', slug: 'physics', credits: 132, duration: '4 Years', description: 'Fundamental laws of nature and their applications in science and technology.' },
      { name: 'Chemistry', slug: 'chemistry', credits: 136, duration: '4 Years', description: 'Chemical principles, laboratory practice, and research in the molecular sciences.' },
    ],
    business: [
      { name: 'Business Administration', slug: 'business-admin', credits: 126, duration: '4 Years', description: 'Core business functions, strategy, and organizational management.' },
      { name: 'Accounting', slug: 'accounting', credits: 132, duration: '4 Years', description: 'Financial reporting, auditing, taxation, and assurance.' },
      { name: 'Economics', slug: 'economics', credits: 124, duration: '4 Years', description: 'Economic theory, policy analysis, and applied econometrics.' },
    ],
    law: [
      { name: 'Law', slug: 'law', credits: 142, duration: '4 Years', description: 'Comprehensive legal education in substantive and procedural law, ethics, and practice.' },
    ],
    it: [
      { name: 'Computer Science', slug: 'computer-science', credits: 132, duration: '4 Years', description: 'Algorithms, software systems, and computational theory.' },
      { name: 'Software Engineering', slug: 'software-engineering', credits: 152, duration: '4 Years', description: 'Systematic design and development of reliable software.' },
      { name: 'Information Systems', slug: 'information-systems', credits: 148, duration: '4 Years', description: 'Business systems, data management, and digital solutions.' },
    ],
    education: [
      { name: 'Education', slug: 'education', credits: 128, duration: '4 Years', description: 'Pedagogy, curriculum development, and educational leadership.' },
      { name: 'Counseling', slug: 'counseling', credits: 132, duration: '4 Years', description: 'School and community counseling, mental health, and student support.' },
    ],
    pharmacy: [
      { name: 'Pharmacy', slug: 'pharmacy', credits: 164, duration: '5 Years', description: 'Pharmaceutical sciences, clinical practice, and patient care.' },
    ],
  };
  return bySlug[slug] || [];
}

async function ensureAdminUser() {
  const client = await pool.connect();
  try {
    const adminEmail = 'admin@najah.edu';
    const hash = await bcrypt.hash('1234', 10);
    const r = await client.query('SELECT 1 FROM app_users WHERE email = $1 LIMIT 1', [adminEmail]);
    if (r.rows.length === 0) {
      const old = await client.query("SELECT 1 FROM app_users WHERE email = 'admin' LIMIT 1");
      if (old.rows.length > 0) {
        await client.query(
          "UPDATE app_users SET email = $1, password_hash = $2 WHERE email = 'admin'",
          [adminEmail, hash]
        );
        console.log('Admin user updated to admin@najah.edu with password 1234.');
      } else {
        await client.query(
          "INSERT INTO app_users (email, password_hash, role) VALUES ($1, $2, 'admin')",
          [adminEmail, hash]
        );
        console.log('Admin user created (email: admin@najah.edu, password: 1234).');
      }
    }
  } finally {
    client.release();
  }
}

async function ensureSeedStudentUser() {
  const studentEmail = 'student@st.najah.edu';
  const client = await pool.connect();
  try {
    const r = await client.query('SELECT 1 FROM app_users WHERE email = $1 LIMIT 1', [studentEmail]);
    if (r.rows.length === 0) {
      const hash = await bcrypt.hash('1234', 10);
      await client.query(
        "INSERT INTO app_users (email, password_hash, role, must_change_password, must_complete_profile) VALUES ($1, $2, 'student', FALSE, FALSE)",
        [studentEmail, hash]
      );
      console.log('Seed student created (email: student@st.najah.edu, password: 1234).');
    }
  } finally {
    client.release();
  }
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const EVENTS = [
  { id: '1', date: 'October 24, 2023', time: '10:00 AM', title: 'Global Research Symposium: Innovation in Tech', location: 'Main Auditorium, New Campus', tag: 'Research', description: 'A gathering of leading researchers and academics to explore cutting-edge developments in technology and their impact on society.', image: '/event1.jpg' },
  { id: '2', date: 'November 02, 2023', time: '2:00 PM', title: 'Fall Open House for Prospective Graduate Students', location: 'Faculty of Graduate Studies', tag: 'Admissions', description: 'An opportunity for prospective students to tour the campus, meet faculty, and learn about our graduate programs.', image: '/event2.jpg' },
  { id: '3', date: 'November 15, 2023', time: '6:00 PM', title: 'International Cultural Exchange Night 2023', location: 'Student Activity Center', tag: 'Culture', description: 'Celebrate the rich diversity of our campus community through food, music, and cultural performances from around the world.', image: '/event3.jpg' },
  { id: '4', date: 'December 05, 2023', time: '9:00 AM', title: 'Campus Sustainability Forum', location: 'Engineering Hall, Room 201', tag: 'Environment', description: "Discussions and workshops focused on sustainable practices, green energy initiatives, and the university's environmental commitments.", image: '/event4.jpg' },
];

app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: 'Backend running' });
});

// --- Colleges (public: from DB) ---
app.get('/api/colleges', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, short_name, slug, description FROM colleges ORDER BY id'
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List colleges error:', err);
    res.status(500).json({ error: 'Could not load colleges.' });
  }
});

app.get('/api/colleges/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query(
      `SELECT id, name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url
       FROM colleges WHERE id = $1 LIMIT 1`,
      [id]
    );
    const college = r.rows[0];
    if (!college) return res.status(404).json({ error: 'College not found.' });
    const prog = await pool.query(
      `SELECT id, name, slug, credits, duration, description, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level
       FROM academic_programs WHERE college_id = $1 ORDER BY sort_order, name`,
      [id]
    );
    const badges = [
      ...(college.badge_1_label ? [{ label: college.badge_1_label, icon: college.badge_1_icon || 'check' }] : []),
      ...(college.badge_2_label ? [{ label: college.badge_2_label, icon: college.badge_2_icon || 'users' }] : []),
    ];
    const stats = [college.stat_1, college.stat_2, college.stat_3, college.stat_4].filter(Boolean);
    res.json({
      ...college,
      badges,
      stats,
      majors: prog.rows,
    });
  } catch (err) {
    console.error('Get college error:', err);
    res.status(500).json({ error: 'Could not load college.' });
  }
});

// Single program (for /majors/:id detail page)
app.get('/api/programs/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const r = await pool.query(
      `SELECT p.id, p.name, p.slug, p.credits, p.duration, p.description, p.department, p.required_gpa, p.high_school_track, p.degree_type, p.about_text, p.image_url, p.degree_level, p.college_id,
              c.name AS college_name, c.short_name AS college_short_name
       FROM academic_programs p
       JOIN colleges c ON c.id = p.college_id
       WHERE p.id = $1 LIMIT 1`,
      [id]
    );
    const program = r.rows[0];
    if (!program) return res.status(404).json({ error: 'Program not found.' });
    res.json(program);
  } catch (err) {
    console.error('Get program error:', err);
    res.status(500).json({ error: 'Could not load program.' });
  }
});

// Legacy: list all majors (for admin dashboard count; returns flat list)
app.get('/api/majors', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT p.id, p.name, p.college_id, c.name AS college_name FROM academic_programs p JOIN colleges c ON c.id = p.college_id ORDER BY c.name, p.sort_order, p.name`
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List majors error:', err);
    res.status(500).json({ error: 'Could not load majors.' });
  }
});

app.get('/api/events', (req, res) => {
  res.json(EVENTS);
});

app.get('/api/events/:id', (req, res) => {
  const event = EVENTS.find(e => String(e.id) === String(req.params.id));
  if (!event) return res.status(404).json({ error: 'Event not found.' });
  res.json(event);
});

// Admin users API (router so DELETE /:id is matched reliably)
const adminUsersRouter = express.Router();

adminUsersRouter.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, email, role, first_name, middle_name, last_name,
              student_number, college, major, phone, must_change_password, created_at
       FROM app_users ORDER BY created_at DESC`
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Could not load users.' });
  }
});

adminUsersRouter.post('/', async (req, res) => {
  const { first_name, middle_name, last_name, student_number, college, major, phone, email, role } = req.body || {};
  const fn = typeof first_name === 'string' ? first_name.trim() : '';
  const ln = typeof last_name === 'string' ? last_name.trim() : '';
  const sn = typeof student_number === 'string' ? student_number.trim() : String(student_number || '').trim();
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!fn || !ln || !sn || !em) {
    return res.status(400).json({ error: 'First name, last name, student number, and email are required.' });
  }
  const userRole = (role === 'admin') ? 'admin' : 'student';
  try {
    const hash = await bcrypt.hash(sn, 10);
    const r = await pool.query(
      `INSERT INTO app_users (email, password_hash, role, first_name, middle_name, last_name, student_number, college, major, phone, must_change_password, must_complete_profile)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, FALSE)
       RETURNING id, email, role, first_name, middle_name, last_name, student_number, college, major, phone, must_change_password, created_at`,
      [em, hash, userRole, fn, (middle_name && String(middle_name).trim()) || null, ln, sn, (college && String(college).trim()) || null, (major && String(major).trim()) || null, (phone && String(phone).trim()) || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const detail = err.detail || '';
      if (detail.includes('email')) return res.status(409).json({ error: 'This email is already registered.' });
      if (detail.includes('student_number')) return res.status(409).json({ error: 'This student number already exists.' });
      return res.status(409).json({ error: 'Duplicate entry.' });
    }
    console.error('Create user error:', err);
    const msg = process.env.NODE_ENV !== 'production' && err.message ? err.message : 'Could not create user.';
    res.status(500).json({ error: msg });
  }
});

adminUsersRouter.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid user ID.' });
  const { first_name, middle_name, last_name, student_number, college, major, phone, email, role, new_password } = req.body || {};
  const fn = typeof first_name === 'string' ? first_name.trim() : '';
  const ln = typeof last_name === 'string' ? last_name.trim() : '';
  const sn = typeof student_number === 'string' ? student_number.trim() : String(student_number || '').trim();
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!fn || !ln || !sn || !em) {
    return res.status(400).json({ error: 'First name, last name, student number, and email are required.' });
  }
  const userRole = (role === 'admin') ? 'admin' : 'student';
  try {
    const existing = await pool.query('SELECT id FROM app_users WHERE id = $1', [id]);
    if (!existing.rows[0]) return res.status(404).json({ error: 'User not found.' });
    if (new_password && String(new_password).trim()) {
      const hash = await bcrypt.hash(String(new_password).trim(), 10);
      await pool.query(
        `UPDATE app_users SET first_name = $1, middle_name = $2, last_name = $3, student_number = $4, college = $5, major = $6, phone = $7, email = $8, role = $9, password_hash = $10, must_change_password = TRUE WHERE id = $11`,
        [fn, (middle_name && String(middle_name).trim()) || null, ln, sn, (college && String(college).trim()) || null, (major && String(major).trim()) || null, (phone && String(phone).trim()) || null, em, userRole, hash, id]
      );
    } else {
      await pool.query(
        `UPDATE app_users SET first_name = $1, middle_name = $2, last_name = $3, student_number = $4, college = $5, major = $6, phone = $7, email = $8, role = $9 WHERE id = $10`,
        [fn, (middle_name && String(middle_name).trim()) || null, ln, sn, (college && String(college).trim()) || null, (major && String(major).trim()) || null, (phone && String(phone).trim()) || null, em, userRole, id]
      );
    }
    const r = await pool.query(
      `SELECT id, email, role, first_name, middle_name, last_name, student_number, college, major, phone, must_change_password, created_at FROM app_users WHERE id = $1`,
      [id]
    );
    res.json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      const detail = err.detail || '';
      if (detail.includes('email')) return res.status(409).json({ error: 'This email is already registered.' });
      if (detail.includes('student_number')) return res.status(409).json({ error: 'This student number already exists.' });
      return res.status(409).json({ error: 'Duplicate entry.' });
    }
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Could not update user.' });
  }
});

adminUsersRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid user ID.' });
  try {
    const r = await pool.query('SELECT id, role FROM app_users WHERE id = $1', [id]);
    const target = r.rows[0];
    if (!target) return res.status(404).json({ error: 'User not found.' });
    if (target.role === 'admin') return res.status(403).json({ error: 'Cannot delete admin users.' });
    await pool.query('DELETE FROM app_users WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Could not delete user.' });
  }
});

app.use('/api/admin/users', adminUsersRouter);

app.post('/api/auth/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body || {};
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (newPassword.length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters.' });
  }
  try {
    const r = await pool.query('SELECT id, password_hash FROM app_users WHERE email = $1 LIMIT 1', [email.trim().toLowerCase()]);
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(oldPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE app_users SET password_hash = $1, must_change_password = FALSE WHERE id = $2', [hash, user.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Could not change password.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  try {
    const r = await pool.query(
      'SELECT id, email, password_hash, role, first_name, last_name, must_change_password, must_complete_profile FROM app_users WHERE email = $1 LIMIT 1',
      [String(email).trim().toLowerCase()]
    );
    const user = r.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const displayName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: displayName,
        must_change_password: user.must_change_password,
        must_complete_profile: user.must_complete_profile ?? false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

app.post('/api/auth/google', async (req, res) => {
  const { credential, access_token } = req.body || {};
  if (!credential && !access_token) {
    return res.status(400).json({ error: 'Missing Google credential or access token.' });
  }
  try {
    let data;
    if (credential) {
      const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
      const resp = await fetch(url);
      data = await resp.json();
      if (!resp.ok) {
        console.error('Google tokeninfo error:', resp.status, data);
        const msg = (data.error_description || data.error || '').toString();
        const hint = msg.toLowerCase().includes('invalid') || resp.status === 401
          ? ' Check that your app URL is in Authorized JavaScript origins in Google Cloud Console.'
          : '';
        return res.status(401).json({
          error: (data.error_description || data.error || 'Invalid Google sign-in. Please try again.') + hint,
        });
      }
    } else {
      const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      data = await resp.json();
      if (!resp.ok) {
        console.error('Google userinfo error:', resp.status, data);
        const msg = (data.error?.message || data.error_description || data.error || '').toString();
        const hint = msg.toLowerCase().includes('invalid') || resp.status === 401
          ? ' Ensure your app URL (e.g. http://localhost:1573) is in Authorized JavaScript origins and you are using a valid Client ID.'
          : '';
        return res.status(401).json({
          error: (data.error?.message || data.error_description || data.error || 'Invalid Google sign-in. Please try again.') + hint,
        });
      }
      data.email_verified = data.email ? true : false;
    }
    const email = (data.email || '').trim().toLowerCase();
    if (!email || !data.email_verified) {
      return res.status(401).json({ error: 'Could not verify your Google account.' });
    }
    if (!isValidNajahEmail(email)) {
      return res.status(403).json({
        error: 'Please use a Najah University Google account (@stu.najah.edu or @najah.edu).',
      });
    }
    let r = await pool.query(
      `SELECT id, email, role, first_name, last_name, must_change_password, must_complete_profile
       FROM app_users WHERE email = $1 LIMIT 1`,
      [email]
    );
    let user = r.rows[0];
    if (!user) {
      // First-time Google sign-in: create student and require profile completion
      const placeholderHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const googleName = (data.name || '').trim() || email;
      const parts = googleName.split(/\s+/);
      const firstName = parts[0] || null;
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
      r = await pool.query(
        `INSERT INTO app_users (email, password_hash, role, first_name, last_name, must_change_password, must_complete_profile)
         VALUES ($1, $2, 'student', $3, $4, FALSE, TRUE)
         RETURNING id, email, role, first_name, last_name, must_change_password, must_complete_profile`,
        [email, placeholderHash, firstName, lastName]
      );
      user = r.rows[0];
    }
    const displayName = user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.email;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: displayName,
        must_change_password: user.must_change_password ?? false,
        must_complete_profile: user.must_complete_profile ?? false,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Sign-in failed. Please try again.' });
  }
});

app.post('/api/auth/complete-profile', async (req, res) => {
  const { email, first_name, middle_name, last_name, student_number, college, major, phone, password } = req.body || {};
  const fn = typeof first_name === 'string' ? first_name.trim() : '';
  const ln = typeof last_name === 'string' ? last_name.trim() : '';
  const sn = typeof student_number === 'string' ? student_number.trim() : String(student_number || '').trim();
  const em = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!em || !fn || !ln || !sn) {
    return res.status(400).json({ error: 'Email, first name, last name, and student number are required.' });
  }
  const rawPassword = typeof password === 'string' ? password.trim() : '';
  if (!rawPassword) {
    return res.status(400).json({ error: 'Password is required to complete your profile.' });
  }
  if (rawPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }
  try {
    const r = await pool.query(
      `SELECT id, must_complete_profile FROM app_users WHERE email = $1 LIMIT 1`,
      [em]
    );
    const user = r.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (!user.must_complete_profile) {
      return res.status(400).json({ error: 'Profile already completed.' });
    }
    const passwordHash = await bcrypt.hash(rawPassword, 10);
    await pool.query(
      `UPDATE app_users SET first_name = $1, middle_name = $2, last_name = $3, student_number = $4, college = $5, major = $6, phone = $7, password_hash = $8, must_change_password = FALSE, must_complete_profile = FALSE
       WHERE id = $9`,
      [fn, (middle_name && String(middle_name).trim()) || null, ln, sn, (college && String(college).trim()) || null, (major && String(major).trim()) || null, (phone && String(phone).trim()) || null, passwordHash, user.id]
    );
    const updated = await pool.query(
      `SELECT id, email, role, first_name, last_name, must_change_password, must_complete_profile FROM app_users WHERE id = $1`,
      [user.id]
    );
    const u = updated.rows[0];
    const displayName = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : u.email;
    res.json({
      user: {
        id: u.id,
        email: u.email,
        role: u.role,
        name: displayName,
        must_change_password: u.must_change_password ?? false,
        must_complete_profile: false,
      },
    });
  } catch (err) {
    if (err.code === '23505' && (err.detail || '').includes('student_number')) {
      return res.status(409).json({ error: 'This student number is already registered.' });
    }
    console.error('Complete profile error:', err);
    res.status(500).json({ error: 'Could not save profile.' });
  }
});

// --- Admin: Colleges CRUD ---
app.get('/api/admin/colleges', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url, created_at FROM colleges ORDER BY id'
    );
    res.json(r.rows);
  } catch (err) {
    console.error('Admin list colleges error:', err);
    res.status(500).json({ error: 'Could not load colleges.' });
  }
});

app.post('/api/admin/colleges', async (req, res) => {
  const { name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url } = req.body || {};
  const n = typeof name === 'string' ? name.trim() : '';
  const sn = typeof short_name === 'string' ? short_name.trim() : '';
  const sl = typeof slug === 'string' ? slug.trim().toLowerCase().replace(/\s+/g, '-') : '';
  if (!n || !sn || !sl) return res.status(400).json({ error: 'Name, short name, and slug are required.' });
  try {
    const r = await pool.query(
      `INSERT INTO colleges (name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url, created_at`,
      [n, sn, sl, (tagline && String(tagline).trim()) || null, (description && String(description).trim()) || null, (badge_1_label && String(badge_1_label).trim()) || null, (badge_1_icon && String(badge_1_icon).trim()) || 'check', (badge_2_label && String(badge_2_label).trim()) || null, (badge_2_icon && String(badge_2_icon).trim()) || 'users', (stat_1 && String(stat_1).trim()) || null, (stat_2 && String(stat_2).trim()) || null, (stat_3 && String(stat_3).trim()) || null, (stat_4 && String(stat_4).trim()) || null, (image_url && String(image_url).trim()) || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A college with this slug already exists.' });
    console.error('Create college error:', err);
    res.status(500).json({ error: 'Could not create college.' });
  }
});

app.put('/api/admin/colleges/:id', async (req, res) => {
  const id = req.params.id;
  const { name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url } = req.body || {};
  const n = typeof name === 'string' ? name.trim() : '';
  const sn = typeof short_name === 'string' ? short_name.trim() : '';
  const sl = typeof slug === 'string' ? slug.trim().toLowerCase().replace(/\s+/g, '-') : '';
  if (!n || !sn || !sl) return res.status(400).json({ error: 'Name, short name, and slug are required.' });
  try {
    const r = await pool.query(
      `UPDATE colleges SET name = $1, short_name = $2, slug = $3, tagline = $4, description = $5, badge_1_label = $6, badge_1_icon = $7, badge_2_label = $8, badge_2_icon = $9, stat_1 = $10, stat_2 = $11, stat_3 = $12, stat_4 = $13, image_url = $14, updated_at = NOW()
       WHERE id = $15 RETURNING id, name, short_name, slug, tagline, description, badge_1_label, badge_1_icon, badge_2_label, badge_2_icon, stat_1, stat_2, stat_3, stat_4, image_url, updated_at`,
      [n, sn, sl, (tagline && String(tagline).trim()) || null, (description && String(description).trim()) || null, (badge_1_label && String(badge_1_label).trim()) || null, (badge_1_icon && String(badge_1_icon).trim()) || 'check', (badge_2_label && String(badge_2_label).trim()) || null, (badge_2_icon && String(badge_2_icon).trim()) || 'users', (stat_1 && String(stat_1).trim()) || null, (stat_2 && String(stat_2).trim()) || null, (stat_3 && String(stat_3).trim()) || null, (stat_4 && String(stat_4).trim()) || null, (image_url && String(image_url).trim()) || null, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'College not found.' });
    res.json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A college with this slug already exists.' });
    console.error('Update college error:', err);
    res.status(500).json({ error: 'Could not update college.' });
  }
});

app.delete('/api/admin/colleges/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM colleges WHERE id = $1 RETURNING id', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'College not found.' });
    res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error('Delete college error:', err);
    res.status(500).json({ error: 'Could not delete college.' });
  }
});

// --- Admin: Academic programs CRUD ---
app.get('/api/admin/colleges/:id/programs', async (req, res) => {
  try {
    const r = await pool.query(
      `SELECT id, college_id, name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level, created_at
       FROM academic_programs WHERE college_id = $1 ORDER BY sort_order, name`,
      [req.params.id]
    );
    res.json(r.rows);
  } catch (err) {
    console.error('List programs error:', err);
    res.status(500).json({ error: 'Could not load programs.' });
  }
});

app.post('/api/admin/colleges/:id/programs', async (req, res) => {
  const collegeId = req.params.id;
  const { name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level } = req.body || {};
  const n = typeof name === 'string' ? name.trim() : '';
  const sl = typeof slug === 'string' ? slug.trim().toLowerCase().replace(/\s+/g, '-') : (n ? n.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : '');
  if (!n) return res.status(400).json({ error: 'Program name is required.' });
  try {
    const r = await pool.query(
      `INSERT INTO academic_programs (college_id, name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING id, college_id, name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level, created_at`,
      [collegeId, n, sl || 'program', Number(credits) || null, (duration && String(duration).trim()) || null, (description && String(description).trim()) || null, Number(sort_order) || 0, (department && String(department).trim()) || null, (required_gpa && String(required_gpa).trim()) || null, (high_school_track && String(high_school_track).trim()) || null, (degree_type && String(degree_type).trim()) || null, (about_text && String(about_text).trim()) || null, (image_url && String(image_url).trim()) || null, (degree_level && String(degree_level).trim()) || 'UNDERGRADUATE']
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A program with this slug already exists in this college.' });
    if (err.code === '23503') return res.status(404).json({ error: 'College not found.' });
    console.error('Create program error:', err);
    res.status(500).json({ error: 'Could not create program.' });
  }
});

app.put('/api/admin/programs/:id', async (req, res) => {
  const id = req.params.id;
  const { name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level } = req.body || {};
  const n = typeof name === 'string' ? name.trim() : '';
  if (!n) return res.status(400).json({ error: 'Program name is required.' });
  const sl = typeof slug === 'string' ? slug.trim().toLowerCase().replace(/\s+/g, '-') : null;
  try {
    const r = await pool.query(
      `UPDATE academic_programs SET name = $1, slug = COALESCE($2, slug), credits = $3, duration = $4, description = $5, sort_order = $6, department = $7, required_gpa = $8, high_school_track = $9, degree_type = $10, about_text = $11, image_url = $12, degree_level = COALESCE($13, degree_level), updated_at = NOW()
       WHERE id = $14 RETURNING id, college_id, name, slug, credits, duration, description, sort_order, department, required_gpa, high_school_track, degree_type, about_text, image_url, degree_level, updated_at`,
      [n, sl, Number(credits) || null, (duration && String(duration).trim()) || null, (description && String(description).trim()) || null, Number(sort_order) ?? 0, (department && String(department).trim()) || null, (required_gpa && String(required_gpa).trim()) || null, (high_school_track && String(high_school_track).trim()) || null, (degree_type && String(degree_type).trim()) || null, (about_text && String(about_text).trim()) || null, (image_url && String(image_url).trim()) || null, (degree_level && String(degree_level).trim()) || null, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'Program not found.' });
    res.json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'A program with this slug already exists in this college.' });
    console.error('Update program error:', err);
    res.status(500).json({ error: 'Could not update program.' });
  }
});

app.delete('/api/admin/programs/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM academic_programs WHERE id = $1 RETURNING id', [req.params.id]);
    if (r.rows.length === 0) return res.status(404).json({ error: 'Program not found.' });
    res.json({ ok: true, id: r.rows[0].id });
  } catch (err) {
    console.error('Delete program error:', err);
    res.status(500).json({ error: 'Could not delete program.' });
  }
});

// 404 for any unmatched route (so API returns JSON and we can see what path was hit)
app.use((req, res) => {
  console.warn('404', req.method, req.path);
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

app.listen(PORT, async () => {
  console.log(`Backend server at http://localhost:${PORT}`);
  try {
    await ensureSchema();
    await seedCollegesIfEmpty();
    await ensureAdminUser();
    await ensureSeedStudentUser();
  } catch (e) {
    console.error('Startup error:', e.message);
  }
});
