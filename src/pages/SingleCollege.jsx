import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

const INITIAL_MAJORS_COUNT = 6;

// Image paths: place files in public/majors/ (e.g. computer-science.jpg)
const getMajorImage = (slug) => `/majors/${slug || 'placeholder'}.jpg`;

// College of Engineering — full detail (id "1")
const COLLEGE_ENGINEERING = {
  id: '1',
  shortName: 'Engineering & IT',
  name: 'College of Engineering & Information Technology',
  tagline: 'EXCELLENCE IN TECHNOLOGY',
  description: 'Empowering the next generation of innovators through rigorous academic programs, world-class research facilities, and industry-leading faculty expertise.',
  badges: [
    { label: 'ABET Accredited', icon: 'check' },
    { label: '4,500+ Students', icon: 'users' },
  ],
  majors: [
    { id: 'eng-mis', slug: 'management-information-systems', name: 'Management Information Systems (MIS)', credits: 150, description: 'Bridging business strategy and information technology for modern organizations.' },
    { id: 'eng-cs', slug: 'computer-science', name: 'Computer Science', credits: 150, description: 'Study algorithms, software systems, and computational theory to solve complex problems.' },
    { id: 'eng-ee', slug: 'electrical-engineering', name: 'Electrical Engineering', credits: 158, description: 'Design and analyze electrical systems, from microelectronics to power grids.' },
    { id: 'eng-ce', slug: 'civil-engineering', name: 'Civil Engineering', credits: 155, description: 'Plan, design, and manage infrastructure that shapes our built environment.' },
    { id: 'eng-me', slug: 'mechanical-engineering', name: 'Mechanical Engineering', credits: 160, description: 'Apply principles of mechanics and thermodynamics to create machines and systems.' },
    { id: 'eng-it', slug: 'information-technology', name: 'Information Technology', credits: 148, description: 'Bridge business and technology with skills in systems, networks, and data.' },
    { id: 'eng-se', slug: 'software-engineering', name: 'Software Engineering', credits: 152, description: 'Build reliable, scalable software through systematic design and development.' },
    { id: 'eng-che', slug: 'chemical-engineering', name: 'Chemical Engineering', credits: 162, description: 'Apply chemistry and engineering to design processes and products at scale.' },
    { id: 'eng-bme', slug: 'biomedical-engineering', name: 'Biomedical Engineering', credits: 156, description: 'Combine engineering and life sciences to advance healthcare and medical devices.' },
  ],
};

const COLLEGES_MAP = {
  '1': COLLEGE_ENGINEERING,
};

function SingleCollege() {
  const { id } = useParams();
  const college = COLLEGES_MAP[id];

  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc' (name A→Z / Z→A)
  const [showMoreMajors, setShowMoreMajors] = useState(false);

  const sortedMajors = useMemo(() => {
    if (!college?.majors) return [];
    const list = [...college.majors].sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
    return list;
  }, [college?.majors, sortOrder]);

  const visibleMajors = showMoreMajors ? sortedMajors : sortedMajors.slice(0, INITIAL_MAJORS_COUNT);
  const hasMoreMajors = sortedMajors.length > INITIAL_MAJORS_COUNT;

  // Only College of Engineering (id 1) has the full page; others redirect or show coming soon
  if (!college) {
    return (
      <div className="bg-[#f7f6f3] min-h-[50vh] flex items-center justify-center">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 text-center">
          <h1 className="font-serif text-2xl text-[#0b2d52] mb-4">College not found</h1>
          <Link to="/colleges" className="text-[#00356b] font-semibold hover:underline">
            ← Back to Colleges
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-gray-900 bg-white min-h-screen">
      {/* Subtle grid background for hero */}
      <div className="relative bg-[#fafaf9] bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px]">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 pt-8 pb-16">
          {/* Breadcrumbs — Colleges only (no Home) */}
          <nav className="flex items-center gap-2 text-sm mb-10" aria-label="Breadcrumb">
            <Link to="/colleges" className="text-slate-500 hover:text-[#00356b] hover:underline transition">
              Colleges
            </Link>
            <span className="text-slate-300" aria-hidden>›</span>
            <span className="font-semibold text-[#00356b]">{college.shortName}</span>
          </nav>

          {/* Hero: tagline, title, description, badges */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
              {college.tagline}
            </p>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0b2d52] leading-tight tracking-tight mb-5">
              {college.name}
            </h1>
            <p className="text-slate-600 leading-relaxed mb-8">
              {college.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {college.badges.map((badge) => (
                <span
                  key={badge.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white/80 text-[#00356b] font-medium text-sm"
                >
                  {badge.icon === 'check' && (
                    <svg className="w-4 h-4 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {badge.icon === 'users' && (
                    <svg className="w-4 h-4 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {badge.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Programs */}
      <section className="bg-[#f7f6f3] pt-12 pb-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-8 bg-[#00356b] rounded-full flex-shrink-0" aria-hidden />
              <h2 className="text-xl font-serif font-semibold text-[#0b2d52]">
                Academic Programs
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#00356b] border border-slate-200 rounded-md bg-white px-3 py-2 hover:bg-slate-50 hover:border-[#00356b]/30 focus:outline-none focus:ring-2 focus:ring-[#00356b]/20 focus:border-[#00356b] transition-all duration-200"
              aria-label={sortOrder === 'asc' ? 'Sort A to Z (click for Z to A)' : 'Sort Z to A (click for A to Z)'}
            >
              <span className="transition-transform duration-200" style={{ transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'none' }}>
                <svg className="w-4 h-4 text-[#00356b]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </span>
              {sortOrder === 'asc' ? 'Sort A → Z' : 'Sort Z → A'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMajors.map((major) => (
              <Link
                key={major.id}
                to={`/majors/${major.id}`}
                state={{ from: 'college' }}
                className="bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="h-40 rounded-t-lg overflow-hidden bg-slate-100 relative flex">
                  <img
                    src={getMajorImage(major.slug)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 hidden flex items-center justify-center bg-slate-100">
                    <span className="text-xs text-slate-400 uppercase">Major</span>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-lg font-semibold text-[#0b2d52] leading-snug mb-2 group-hover:underline">
                    {major.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
                    {major.description}
                  </p>
                  <span className="text-sm font-semibold text-[#00356b]">
                    View Major →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {hasMoreMajors && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => setShowMoreMajors((v) => !v)}
                className="text-sm font-semibold text-[#00356b] hover:underline"
              >
                {showMoreMajors ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default SingleCollege;
