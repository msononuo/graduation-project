import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Majors() {
  const [majors, setMajors] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/majors')
      .then(r => r.json())
      .then(setMajors)
      .catch(() => setMajors([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-gray-500">Loading programs…</p></div>;
  if (majors.length === 0) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-gray-500">No programs found.</p></div>;

  const byCollege = majors.reduce((acc, m) => {
    const name = m.college_name || 'Other';
    if (!acc[name]) acc[name] = []; acc[name].push(m); return acc;
  }, {});

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-12">
      <h1 className="text-3xl font-bold text-[#0b2d52] mb-8">Academic Programs</h1>
      <div className="space-y-10">
        {Object.entries(byCollege).map(([collegeName, programs]) => (
          <section key={collegeName}>
            <h2 className="text-xl font-semibold text-slate-700 mb-4 border-b border-slate-200 pb-2">{collegeName}</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {programs.map((p) => (
                <li key={p.id}>
                  <Link to={`/majors/${p.id}`} className="block p-4 rounded-lg border border-slate-200 hover:border-[#0b2d52] hover:bg-slate-50 transition-colors">
                    <span className="font-medium text-[#0b2d52]">{p.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

export default Majors;
