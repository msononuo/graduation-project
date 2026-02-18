import { Link } from 'react-router-dom';

const HERO_IMAGE = '/hero-campus.png';

const EVENTS = [
  { id: '1', date: 'October 24, 2023', title: 'Global Research Symposium: Innovation in Tech' },
  { id: '2', date: 'November 02, 2023', title: 'Fall Open House for Prospective Graduate Students' },
  { id: '3', date: 'November 15, 2023', title: 'International Cultural Exchange Night 2023' },
  { id: '4', date: 'December 05, 2023', title: 'Campus Sustainability Forum' },
];

function Home() {
  return (
    <div className="text-gray-900">
      {/* Hero Section — left image, right text + buttons */}
      <section className="relative w-full max-w-screen-2xl mx-auto px-4 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          {/* Left: hero image — larger, dominant */}
          <div className="w-full min-w-0 overflow-hidden rounded-2xl order-1 lg:col-span-8">
            <img
              alt="An-Najah National University campus"
              src={HERO_IMAGE}
              className="w-full h-[320px] lg:h-[560px] object-cover rounded-2xl shadow-lg shadow-black/10 ring-1 ring-black/5 hover:scale-[1.02] transition duration-300"
            />
          </div>
          {/* Right: text block */}
          <div className="w-full flex flex-col justify-center order-2 lg:col-span-4">
            <h1 className="text-4xl lg:text-6xl font-serif font-semibold text-[#00356b] leading-[1.05] tracking-tight mb-6">
              Empowering Your Academic Journey
            </h1>
            <p className="text-xl leading-relaxed text-slate-600 max-w-xl mb-8">
              Access world-class resources, connect with top colleges, and shape your future at Najah.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/majors"
                className="inline-block px-7 py-3.5 rounded-lg bg-[#00356b] text-white font-medium shadow-sm hover:opacity-90 transition duration-200"
              >
                Explore Majors
              </Link>
              <Link
                to="/events"
                className="inline-block px-7 py-3.5 rounded-lg border-2 border-[#00356b] text-[#00356b] font-medium shadow-sm hover:bg-[#00356b]/5 transition duration-200"
              >
                View Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Events — same design as before */}
      <section className="max-w-screen-2xl mx-auto px-4 py-20 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-2xl font-serif font-semibold text-[#00356b]">
            Important Events
          </h3>
          <Link
            to="/events"
            className="text-sm font-bold text-[#00356b] uppercase tracking-wide hover:underline"
          >
            View All Events →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-10">
          {EVENTS.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="border border-gray-200 bg-white p-4 hover:shadow-md transition group rounded-lg"
            >
              <div className="aspect-video bg-gray-100 rounded-sm mb-4 flex items-center justify-center">
                <span className="text-xs text-gray-400 uppercase">Event</span>
              </div>
              <p className="text-xs font-bold text-[#00356b] uppercase tracking-wider mb-2">
                {event.date}
              </p>
              <h4 className="text-base font-serif text-[#00356b] leading-snug group-hover:underline">
                {event.title}
              </h4>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
