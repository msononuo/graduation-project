import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const centerLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/colleges", label: "Colleges" },
  { to: "/majors", label: "Majors" },
  { to: "/events", label: "Events" },
];

const linkBase =
  "text-slate-700 hover:text-[#00356b] hover:underline underline-offset-4 transition-all duration-200";

function LogoPlaceholder() {
  return (
    <svg
      className="h-16 w-16 flex-shrink-0"
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
    `${linkBase} py-4 border-b-2 border-transparent -mb-[2px] ${
      isActive ? "font-semibold text-[#00356b] border-[#00356b]" : ""
    }`;

  const authLinkClass = ({ isActive }) =>
    `${linkBase} py-4 border-b-2 border-transparent -mb-[2px] ${
      isActive ? "font-semibold text-[#00356b] border-[#00356b]" : ""
    }`;

  return (
    <header className="w-full bg-[#fbfbfa] border-b border-slate-200">
      <div className="max-w-screen-2xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4 flex-wrap">
        <NavLink to="/" className="flex items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            {logoError ? (
              <LogoPlaceholder />
            ) : (
              <img
                src="/najah-logo.png"
                alt="An-Najah National University"
                className="h-16 w-auto object-contain flex-shrink-0"
                onError={() => setLogoError(true)}
              />
            )}
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-2xl md:text-3xl font-semibold text-[#00356b] tracking-tight" dir="rtl">
                جامعة النجاح الوطنية
              </span>
              <span className="text-base md:text-lg text-slate-600 font-medium">
                An-Najah National University
              </span>
            </div>
          </div>
        </NavLink>

        <nav className="flex-1 flex justify-center gap-4 sm:gap-6 md:gap-8 min-w-0">
          {centerLinks.map(({ to, label, end }) => (
            <NavLink key={label} to={to} end={end} className={centerLinkClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 sm:gap-6 md:gap-8 flex-shrink-0">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`${authLinkClass({ isActive: false })} border-0 bg-transparent cursor-pointer`}
            >
              Logout
            </button>
          ) : (
            <NavLink to="/login" end className={authLinkClass}>
              Login
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
