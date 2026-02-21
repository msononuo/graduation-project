import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const tagColors = { Research: '#0b2d52', Admissions: '#7a5c2e', Culture: '#2e5e4e', Environment: '#3b5e2e' };

function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    fetch(`/api/events/${id}`)
      .then(r => {
        if (!r.ok) throw new Error('Event not found');
        return r.json();
      })
      .then(setEvent)
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-gray-500">Loading…</p></div>;
  if (error || !event) return <div className="max-w-screen-2xl mx-auto px-6 py-12"><p className="text-red-600">{error || 'Event not found.'}</p><Link to="/events" className="text-[#0b2d52] underline mt-4 inline-block">Back to Events</Link></div>;

  const tagColor = tagColors[event.tag] || '#0b2d52';

  return (
    <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-12">
      <Link to="/events" className="text-[#0b2d52] hover:underline text-sm mb-6 inline-block">← Back to Events</Link>
      <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {event.image && (
          <div className="aspect-[21/9] bg-slate-100">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" onError={e => { e.target.style.display = 'none'; }} />
          </div>
        )}
        <div className="p-8 md:p-12">
          <span className="inline-block px-2 py-0.5 text-white text-xs font-semibold uppercase mb-4" style={{ background: tagColor }}>{event.tag}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#0b2d52] mb-2">{event.title}</h1>
          <p className="text-slate-500 text-sm font-medium mb-6">{event.date} · {event.time}</p>
          {event.location && <p className="text-slate-600 mb-6 flex items-center gap-2"><span className="text-slate-400">Location:</span> {event.location}</p>}
          {event.description && <div className="prose text-slate-700 max-w-none"><p>{event.description}</p></div>}
        </div>
      </article>
    </div>
  );
}

export default EventDetails;
