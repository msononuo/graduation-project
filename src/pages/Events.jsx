import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const tagColors = { Research: '#0b2d52', Admissions: '#7a5c2e', Culture: '#2e5e4e', Environment: '#3b5e2e' };

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-gray-500">Loading events…</p></div>;
  if (events.length === 0) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-gray-500">No events at this time.</p></div>;

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-12">
      <h1 className="text-3xl font-bold text-[#0b2d52] mb-8">Events</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const tagColor = tagColors[event.tag] || '#0b2d52';
          return (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="block bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-slate-100 relative">
                {event.image && (
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
                )}
                <span className="absolute top-3 left-3 text-white px-2 py-0.5 text-xs font-semibold uppercase" style={{ background: tagColor }}>{event.tag}</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{event.date} · {event.time}</p>
                <h2 className="text-xl font-semibold text-[#0b2d52] mb-2">{event.title}</h2>
                <p className="text-sm text-slate-600">{event.location}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Events;
