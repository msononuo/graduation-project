import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const HERO_IMAGE = '/hero-campus.png';

// Add to index.html <head>:
// <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;0,700;1,300&family=Montserrat:wght@300;400;600&display=swap" rel="stylesheet">

const tagColors = {
  Research: '#0b2d52',
  Admissions: '#7a5c2e',
  Culture: '#2e5e4e',
  Environment: '#3b5e2e',
};

function EventCard({ event, featured = false }) {
  const tagColor = tagColors[event.tag] || '#0b2d52';

  if (featured) {
    return (
      <Link
        to={`/events/${event.id}`}
        className="group relative flex flex-col bg-white overflow-hidden row-span-2 border border-slate-200 hover:shadow-2xl transition-all duration-500"
        style={{ textDecoration: 'none' }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: '320px' }}>
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={e => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback placeholder */}
          <div
            className="absolute inset-0 items-center justify-center hidden"
            style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #c8bca8 100%)' }}
          >
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.6rem', letterSpacing: '0.2em', color: '#888', textTransform: 'uppercase' }}>
              {event.tag}
            </span>
          </div>
          {/* Tag badge */}
          <span
            className="absolute top-4 left-4 text-white px-3 py-1"
            style={{
              background: tagColor,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            {event.tag}
          </span>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-7">
          {/* Date & Time */}
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: '2rem', height: '1px', background: tagColor }} />
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.65rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: tagColor,
            }}>
              {event.date} · {event.time}
            </span>
          </div>

          <h3
            className="text-[#0b2d52] leading-tight mb-3 group-hover:text-[#1a4a7a] transition-colors"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.9rem', fontWeight: 600, lineHeight: 1.2 }}
          >
            {event.title}
          </h3>

          <p
            className="text-slate-500 leading-relaxed flex-1 mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontStyle: 'italic', fontWeight: 300 }}
          >
            {event.description}
          </p>

          {/* Location */}
          <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
            <svg width="13" height="13" fill="none" stroke={tagColor} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            <span style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.65rem',
              letterSpacing: '0.08em',
              color: '#666',
            }}>
              {event.location}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex bg-white overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-500"
      style={{ textDecoration: 'none' }}
    >
      {/* Side image */}
      <div className="relative overflow-hidden flex-shrink-0" style={{ width: '130px' }}>
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={e => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div
          className="absolute inset-0 items-center justify-center hidden"
          style={{ background: 'linear-gradient(135deg, #e8e0d0 0%, #c8bca8 100%)' }}
        >
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: '0.55rem', letterSpacing: '0.15em', color: '#888', textTransform: 'uppercase', writingMode: 'vertical-rl' }}>
            {event.tag}
          </span>
        </div>
        {/* Tag */}
        <span
          className="absolute top-3 left-0 text-white px-2 py-0.5"
          style={{
            background: tagColor,
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.5rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
          }}
        >
          {event.tag}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between p-5 flex-1">
        <div>
          <span style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.6rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: tagColor,
          }}>
            {event.date} · {event.time}
          </span>
          <h3
            className="text-[#0b2d52] leading-snug mt-2 mb-2 group-hover:text-[#1a4a7a] transition-colors"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600 }}
          >
            {event.title}
          </h3>
          <p
            className="text-slate-400 leading-relaxed line-clamp-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.92rem', fontStyle: 'italic', fontWeight: 300 }}
          >
            {event.description}
          </p>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-3">
          <svg width="11" height="11" fill="none" stroke={tagColor} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="2.5"/>
          </svg>
          <span style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: '0.6rem',
            letterSpacing: '0.06em',
            color: '#888',
          }}>
            {event.location}
          </span>
        </div>
      </div>
    </Link>
  );
}

function Home() {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents).catch(() => setEvents([]));
  }, []);
  const [featured, ...rest] = events.length > 0 ? events : [];

  return (
    <div className="text-gray-900">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            alt="An-Najah National University campus"
            src={HERO_IMAGE}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden />
        </div>

        <div className="relative z-10 w-full max-w-screen-2xl mx-auto px-6 pb-24 text-left">
          <p
            className="text-white/80 mb-4"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontWeight: 300,
            }}
          >
            Established 1918
          </p>

          <h1 className="leading-tight max-w-3xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            <span className="block text-white" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 700, lineHeight: 1.05 }}>
              Empowering Your
            </span>
            <span className="block text-white" style={{ fontSize: 'clamp(3rem, 7vw, 5.5rem)', fontWeight: 300, lineHeight: 1.1 }}>
              Academic Journey
            </span>
          </h1>

          <p
            className="text-white/85 max-w-xl mt-5 leading-relaxed"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
              fontWeight: 300,
              fontStyle: 'italic',
            }}
          >
            A tradition of excellence in the heart of academic discovery, fostering
            the leaders of tomorrow through innovation and heritage.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            {/* Primary — filled white */}
            <Link
              to="/majors"
              className="inline-block rounded-sm no-underline transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '0.95rem 2.2rem',
                background: '#ffffff',
                color: '#0b2d52',
                border: '2px solid #ffffff',
                textDecoration: 'none',
              }}
            >
              Explore Programs
            </Link>
            {/* Secondary — transparent, hover fills white */}
            <Link
              to="/events"
              className="inline-block rounded-sm border-2 border-white/50 bg-transparent px-9 py-[0.95rem] font-semibold uppercase tracking-widest text-white/90 no-underline transition-all duration-300 ease-out hover:scale-[1.02] hover:border-white hover:bg-white hover:text-[#0b2d52] hover:shadow-lg hover:shadow-black/20"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.8rem',
              }}
            >
              Show All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── Events Section ── */}
      <section style={{ background: '#f5f3ee' }} className="py-20">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-10">

          {/* Section header */}
          <div className="flex items-end justify-between mb-12 pb-5 border-b border-slate-300">
            <div>
              <p style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: '#0b2d52',
                marginBottom: '0.5rem',
              }}>
                University Calendar
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 600,
                color: '#0b2d52',
                lineHeight: 1,
              }}>
                Upcoming Events
              </h2>
            </div>
            <Link
              to="/events"
              className="hidden sm:inline-flex items-center gap-2 text-[#0b2d52] hover:gap-4 transition-all duration-300"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              View All Events
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>

          {/* Magazine Editorial Grid */}
          {featured && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <EventCard event={featured} featured />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                {rest.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Mobile view all */}
          <div className="sm:hidden mt-8 text-center">
            <Link
              to="/events"
              className="inline-block border border-[#0b2d52] text-[#0b2d52] hover:bg-[#0b2d52] hover:text-white transition duration-200"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: '0.65rem',
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                padding: '0.8rem 2rem',
              }}
            >
              View All Events
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;