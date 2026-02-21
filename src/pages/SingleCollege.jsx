import { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

const INITIAL_MAJORS_COUNT = 6;

const getMajorImage = (slug) => `/majors/${slug || 'placeholder'}.jpg`;

function getProgramImage(major) {
  if (major?.image_url) return major.image_url;
  return getMajorImage(major?.slug);
}

function SingleCollege() {
  const { id } = useParams();
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortOrder, setSortOrder] = useState('asc');
  const [filterQuery, setFilterQuery] = useState('');
  const [showMoreMajors, setShowMoreMajors] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/api/colleges/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? 'Not found' : 'Failed to load');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setCollege({ ...data, shortName: data.short_name });
        }
      })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const filteredAndSortedMajors = useMemo(() => {
    if (!college?.majors) return [];
    const q = (filterQuery || '').trim().toLowerCase();
    let list = college.majors;
    if (q) {
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) =>
      sortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    );
  }, [college?.majors, sortOrder, filterQuery]);

  const visibleMajors = showMoreMajors ? filteredAndSortedMajors : filteredAndSortedMajors.slice(0, INITIAL_MAJORS_COUNT);
  const hasMoreMajors = filteredAndSortedMajors.length > INITIAL_MAJORS_COUNT;
  const stats = college?.stats ?? [];

  if (loading) {
    return (
      <div className="bg-[#f7f6f3] min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-600">Loading college…</p>
      </div>
    );
  }
  if (error || !college) {
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
      {/* Hero — image from admin or subtle grid background */}
      <div className={`relative ${college.image_url ? '' : 'bg-[#fafaf9]'} bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:24px_24px]`}>
        {college.image_url && (
          <div className="absolute inset-0 z-0">
            <img src={college.image_url} alt="" className="w-full h-full object-cover opacity-20" aria-hidden />
            <div className="absolute inset-0 bg-white/70" aria-hidden />
          </div>
        )}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-10 pt-8 pb-16">
          {/* Breadcrumbs: Home > Colleges > [College] */}
          <nav className="flex items-center gap-2 text-sm mb-10" aria-label="Breadcrumb">
            <Link to="/" className="text-slate-500 hover:text-[#00356b] hover:underline transition">
              Home
            </Link>
            <span className="text-slate-300" aria-hidden>›</span>
            <Link to="/colleges" className="text-slate-500 hover:text-[#00356b] hover:underline transition">
              Colleges
            </Link>
            <span className="text-slate-300" aria-hidden>›</span>
            <span className="font-semibold text-[#00356b]">{college.shortName}</span>
          </nav>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
      <section className="bg-[#f7f6f3] pt-12 pb-16">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="w-1 h-8 bg-[#00356b] rounded-full flex-shrink-0" aria-hidden />
              <h2 className="text-xl font-serif font-semibold text-[#0b2d52]">
                Academic Programs
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <label className="relative flex-1 min-w-[200px] max-w-xs">
                <span className="sr-only">Filter by major name</span>
                <input
                  type="search"
                  placeholder="Filter by major name..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00356b]/20 focus:border-[#00356b] bg-white"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </label>
              <button
                type="button"
                onClick={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
                className="inline-flex items-center gap-2 text-sm font-medium text-[#00356b] border border-slate-200 rounded-lg bg-white px-3 py-2.5 hover:bg-slate-50 hover:border-[#00356b]/30 focus:outline-none focus:ring-2 focus:ring-[#00356b]/20 transition-all"
                aria-label={sortOrder === 'asc' ? 'Sort A to Z (click for Z to A)' : 'Sort Z to A (click for A to Z)'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Sort
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleMajors.map((major) => (
              <Link
                key={major.id}
                to={`/majors/${major.id}`}
                className="bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="h-44 rounded-t-xl overflow-hidden bg-slate-100 relative flex">
                  <img
                    src={getProgramImage(major)}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const fallback = e.target.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  <div className="absolute inset-0 hidden flex items-center justify-center bg-slate-200">
                    <span className="text-xs text-slate-500 uppercase">Program</span>
                  </div>
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {major.degree_level || 'Undergraduate'}
                  </span>
                  <span className="absolute top-3 right-3 w-14 h-14 rounded-full bg-[#00356b] text-white text-xs font-semibold flex items-center justify-center">
                    {major.duration || '4 Years'}
                  </span>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif text-lg font-semibold text-[#0b2d52] leading-snug mb-2 group-hover:underline">
                    {major.name}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
                    {major.description}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    {major.credits ?? 132} Credit Hours
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#00356b]">
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {filteredAndSortedMajors.length === 0 && (
            <p className="text-center text-slate-500 py-8">No programs match your filter.</p>
          )}

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

      {/* Statistics bar */}
      {stats.length > 0 && (
        <section className="bg-[#0b2d52] text-white py-12" aria-label="College statistics">
          <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
              {stats.map((stat, i) => (
                <div key={i} className="flex items-center gap-6 md:gap-10">
                  <span className="text-sm font-bold uppercase tracking-wider text-white/95">
                    {stat}
                  </span>
                  {i < stats.length - 1 && (
                    <span className="hidden md:inline w-px h-8 bg-white/30" aria-hidden />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default SingleCollege;
