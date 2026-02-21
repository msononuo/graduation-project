import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const INITIAL_COLLEGES_COUNT = 6;

const ICON_DEFAULT = (
  <svg className="w-7 h-7 text-[#00356b]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    fetch('/api/colleges')
      .then((r) => r.json())
      .then(setColleges)
      .catch(() => setColleges([]))
      .finally(() => setLoading(false));
  }, []);

  const visibleColleges = showMore ? colleges : colleges.slice(0, INITIAL_COLLEGES_COUNT);
  const hasMore = colleges.length > INITIAL_COLLEGES_COUNT;

  return (
    <div className="text-gray-900">
      <section className="bg-[#f7f6f3] pt-12 pb-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-[#0b2d52] tracking-tight mb-4">
              Our Colleges
            </h1>
            <p className="text-slate-600 leading-relaxed">
              Explore our diverse range of colleges, each dedicated to excellence in teaching, research, and innovation.
            </p>
          </div>

          {loading ? (
            <p className="text-slate-600 text-center py-12">Loading colleges…</p>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleColleges.map((college) => (
              <div
                key={college.id}
                className="bg-white border border-slate-100 rounded-lg shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-[#00356b]/10 flex items-center justify-center mb-5 flex-shrink-0">
                  {ICON_DEFAULT}
                </div>
                <h2 className="font-serif text-lg font-semibold text-[#0b2d52] leading-snug mb-3">
                  {college.name}
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-5 flex-1">
                  {college.description || 'Explore programs and research in this college.'}
                </p>
                <Link
                  to={`/colleges/${college.id}`}
                  className="text-sm font-semibold text-[#00356b] hover:underline inline-flex items-center gap-1"
                >
                  View Programs
                  <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
          )}

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                className="text-sm font-semibold text-[#00356b] hover:underline"
              >
                {showMore ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default Colleges;
