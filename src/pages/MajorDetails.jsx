import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import MajorChat from '../components/MajorChat';

// Full details per major (for major detail page)
const MAJORS_DETAILS = {
  'eng-mis': {
    id: 'eng-mis',
    name: 'Management Information Systems (MIS)',
    shortName: 'MIS',
    department: 'Department of Information Systems',
    collegeId: '1',
    collegeName: 'College of Engineering & Information Technology',
    collegeShortName: 'Engineering & IT',
    tagline: 'Bridging business strategy and information technology',
    requiredGpa: '80%',
    highSchoolTrack: 'Scientific, Lit, Comm',
    degreeType: 'B.Sc',
    studyDuration: '4 Years',
    aboutText: 'The Management Information Systems (MIS) program prepares students to design, implement, and manage information systems that support organizational goals. You will learn to analyze business needs, evaluate technology solutions, and lead digital transformation projects. The curriculum combines core business knowledge with technical skills in databases, systems analysis, and enterprise applications, preparing graduates for roles such as systems analyst, IT consultant, business analyst, and project manager.',
  },
  'eng-cs': {
    id: 'eng-cs',
    name: 'Computer Science',
    shortName: 'Computer Science',
    department: 'Department of Computer Science',
    collegeId: '1',
    collegeName: 'College of Engineering & Information Technology',
    collegeShortName: 'Engineering & IT',
    tagline: 'Algorithms, software systems, and computational theory',
    requiredGpa: '85%',
    highSchoolTrack: 'Scientific',
    degreeType: 'B.Sc',
    studyDuration: '4 Years',
    aboutText: 'The Computer Science program provides a strong foundation in algorithms, programming, data structures, and software engineering. Students learn to solve complex problems and build reliable software systems for industry and research.',
  },
  'eng-it': {
    id: 'eng-it',
    name: 'Information Technology',
    shortName: 'Information Technology',
    department: 'Department of Information Technology',
    collegeId: '1',
    collegeName: 'College of Engineering & Information Technology',
    collegeShortName: 'Engineering & IT',
    tagline: 'Systems, networks, and data in business and technology',
    requiredGpa: '78%',
    highSchoolTrack: 'Scientific, Lit, Comm',
    degreeType: 'B.Sc',
    studyDuration: '4 Years',
    aboutText: 'The Information Technology program bridges business and technology, focusing on systems administration, networking, databases, and application development to support organizational needs.',
  },
};

const INFO_CARD_ICONS = {
  gpa: (
    <svg className="w-5 h-5 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  track: (
    <svg className="w-5 h-5 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
  degree: (
    <svg className="w-5 h-5 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  duration: (
    <svg className="w-5 h-5 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
};

function MajorDetails() {
  const { id } = useParams();
  const major = MAJORS_DETAILS[id];

  // Scroll to top when navigating to this major page (fixes content appearing at bottom)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!major) {
    return (
      <div className="bg-[#f7f6f3] min-h-[50vh] flex items-center justify-center">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <h1 className="font-serif text-2xl text-[#0b2d52] mb-4">Major not found</h1>
          <Link to="/colleges" className="text-[#00356b] font-semibold hover:underline">
            ← Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  const infoCards = [
    { key: 'gpa', label: 'Required GPA', value: major.requiredGpa },
    { key: 'track', label: 'High School Track', value: major.highSchoolTrack },
    { key: 'degree', label: 'Degree Type', value: major.degreeType },
    { key: 'duration', label: 'Study Duration', value: major.studyDuration },
  ];

  return (
    <div className="text-gray-900 bg-white min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 pt-8 pb-20">
        {/* Breadcrumb — Colleges → Engineering & IT → Major (same style as colleges page) */}
        <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
          <Link to="/colleges" className="text-slate-500 hover:text-[#00356b] hover:underline transition">
            Colleges
          </Link>
          <span className="text-slate-300" aria-hidden>›</span>
          <Link to={`/colleges/${major.collegeId}`} className="text-slate-500 hover:text-[#00356b] hover:underline transition">
            {major.collegeShortName}
          </Link>
          <span className="text-slate-300" aria-hidden>›</span>
          <span className="font-semibold text-[#00356b]">{major.shortName}</span>
        </nav>

        {/* Title block — department, major name, subtitle */}
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-[#00356b]/80 uppercase tracking-widest mb-2">
            {major.department}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0b2d52] leading-tight tracking-tight mb-4">
            {major.name}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-2 text-slate-600 text-sm">
            <span>{major.collegeName}</span>
            <span className="text-slate-300" aria-hidden>|</span>
            <span>{major.tagline}</span>
          </div>
        </div>

        {/* Key info cards — 4 cards, responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {infoCards.map(({ key, label, value }) => (
            <div
              key={key}
              className="bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 p-5 text-center"
            >
              <div className="flex justify-center mb-3">
                {INFO_CARD_ICONS[key]}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                {label}
              </p>
              <p className="font-serif text-lg font-semibold text-[#0b2d52]">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* About the Major */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl font-semibold text-[#0b2d52] text-center mb-6">
            About the Major
          </h2>
          <p className="text-slate-600 leading-relaxed text-center max-w-3xl mx-auto">
            {major.aboutText}
          </p>
        </section>

        <MajorChat majorName={major.name} majorShortName={major.shortName} />
      </div>
    </div>
  );
}

export default MajorDetails;
