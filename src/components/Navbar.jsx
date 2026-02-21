import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const centerLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/colleges", label: "Colleges" },
  { to: "/majors", label: "Majors" },
  { to: "/events", label: "Events" },
];

const linkBase =
  "text-slate-700 hover:text-[#00356b] transition-all duration-200";

function LogoPlaceholder({ className = "" }) {
  return (
    <svg
      className={`flex-shrink-0 ${className}`}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle cx="20" cy="20" r="18" stroke="#00356b" strokeWidth="2" fill="none" />
      <text x="20" y="26" fontFamily="Georgia, serif" fontSize="18" fontWeight="600" fill="#00356b" textAnchor="middle">N</text>
    </svg>
  );
}

function Navbar() {
  const location = useLocation();
  const [logoError, setLogoError] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      setUser(stored ? JSON.parse(stored) : null);
    } catch {
      setUser(null);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const centerLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? "border-b-2 border-[#00356b] pb-1 font-semibold text-[#00356b]" : "border-b-2 border-transparent pb-1"}`;

  const authLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? "border-b-2 border-[#00356b] pb-1 font-semibold text-[#00356b]" : "border-b-2 border-transparent pb-1"}`;

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-slate-200 transition-all duration-200 ${
        scrolled ? "bg-white/95 shadow-sm backdrop-blur-sm" : "bg-[#fbfbfa]"
      }`}
    >
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-10 py-2 md:py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3 lg:gap-4 flex-shrink-0 min-w-0">
          <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
            {logoError ? (
              <LogoPlaceholder className="h-14 w-14 md:h-16 md:w-16" />
            ) : (
              <img
                src="/najah-logo.png"
                alt="An-Najah National University"
                className="h-14 w-auto md:h-16 object-contain flex-shrink-0"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-serif text-xl md:text-2xl font-bold text-[#00356b] tracking-tight leading-tight" dir="rtl">
                جامعة النجاح الوطنية
              </span>
              <span className="text-sm text-slate-600 leading-snug">
                An-Najah National University
              </span>
            </div>
          </div>
        </NavLink>

        {/* Center links — desktop only */}
        <nav className="hidden lg:flex flex-1 justify-center gap-6 xl:gap-8 min-w-0" aria-label="Main">
          {centerLinks.map(({ to, label, end }) => (
            <NavLink key={label} to={to} end={end} className={centerLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-shrink-0">
          {user?.role === "admin" && (
            <NavLink to="/admin" end className={authLinkClass}>
              Admin
            </NavLink>
          )}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`${authLinkClass({ isActive: false })} border-0 bg-transparent cursor-pointer`}
            >
              Logout
            </button>
          ) : (
            <>
              <NavLink to="/login" end className={authLinkClass}>
                Login
              </NavLink>
              <span className="h-4 w-px bg-slate-200" aria-hidden />
              <NavLink to="/register" end className={authLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile: hamburger */}
        <div className="flex lg:hidden items-center gap-2 flex-shrink-0">
          <button
            type="button"
            className="p-2 rounded-md text-slate-700 hover:text-[#00356b] hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#00356b]/30"
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div
        id="nav-menu"
        className={`lg:hidden overflow-hidden transition-all duration-200 ${
          menuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="bg-white border-t border-slate-200 shadow-lg mx-4 mb-4 rounded-lg border border-slate-200 py-4 px-4"
          aria-label="Mobile"
        >
          <ul className="flex flex-col gap-1">
            {centerLinks.map(({ to, label, end }) => (
              <li key={label}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `block py-3 px-4 rounded-md ${linkBase} ${isActive ? "font-semibold text-[#00356b] bg-slate-50" : ""}`
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            <li className="border-t border-slate-100 mt-2 pt-2">
              <NavLink
                to="/login"
                end
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-md ${linkBase} ${isActive ? "font-semibold text-[#00356b]" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Login
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/register"
                end
                className={({ isActive }) =>
                  `block py-3 px-4 rounded-md ${linkBase} ${isActive ? "font-semibold text-[#00356b]" : ""}`
                }
                onClick={() => setMenuOpen(false)}
              >
                Register
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
