import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Search, Home, User, Bookmark, Mail, Sun, Moon, ShieldAlert } from "lucide-react";
import NotificationBell from "./NotificationBell";

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

const navLinks = [
  { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
  { to: "/bookmarks", icon: Bookmark, label: "Bookmarks", match: (p: string) => p === "/bookmarks" },
  { to: "/messages", icon: Mail, label: "Messages", match: (p: string) => p.startsWith("/messages") },
];

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const { theme, toggle: toggleTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  return (
    <>
      {/* Top navbar */}
      <div className="navbar bg-base-200/80 backdrop-blur-lg border-b border-base-300 sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-extrabold tracking-tight gap-0 text-base-content hover:text-primary transition-colors">
            Yap<span className="text-primary">.</span>
          </Link>
        </div>

        <div className="flex-none flex items-center gap-2">
          {user && (
            <form onSubmit={handleSearch} className="flex items-center">
              <label className="input input-bordered bg-base-100/50 w-36 sm:w-48 md:w-80 flex items-center gap-2 focus-within:outline-primary">
                <Search className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="grow bg-transparent outline-none text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </form>
          )}
          <button
            className="btn btn-ghost btn-circle hover:bg-base-300 transition-colors"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Left sidebar */}
      {user && (
        <div className="hidden md:flex fixed left-0 top-16 bottom-0 w-56 flex-col items-start gap-1 pt-4 pl-4 z-40 border-r border-base-300/50 bg-base-100">
          {navLinks.map(({ to, icon: Icon, label, match }) => {
            const active = match(location.pathname);
            return (
              <Link
                key={to}
                to={to}
                className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start transition-all duration-200 rounded-xl ${
                  active
                    ? "bg-primary/12 text-primary font-semibold"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="hidden md:inline text-lg">{label}</span>
              </Link>
            );
          })}
          <NotificationBell />
          {user.role === "Admin" && (
            <Link
              to="/admin/reports"
              className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start transition-all duration-200 rounded-xl ${
                location.pathname.startsWith("/admin/reports")
                  ? "bg-primary/12 text-primary font-semibold"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
              <span className="hidden md:inline text-lg">Reports</span>
            </Link>
          )}
          <Link
            to={`/profile/${user.id}`}
            className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start transition-all duration-200 rounded-xl ${
              location.pathname.startsWith("/profile")
                ? "bg-primary/12 text-primary font-semibold"
                : "text-base-content/70 hover:text-base-content hover:bg-base-200/70"
            }`}
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline text-lg">Profile</span>
          </Link>
        </div>
      )}

      {/* Mobile bottom tabs */}
      {user && (
        <nav className="md:hidden fixed left-0 right-0 bottom-0 z-50 border-t border-base-300 bg-base-100/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
          <div className="mx-auto flex h-16 max-w-xl items-stretch justify-around px-1">
            {navLinks.map(({ to, icon: Icon, label, match }) => {
              const active = match(location.pathname);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                    active ? "text-primary font-semibold" : "text-base-content/60 hover:text-base-content"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="max-w-full truncate">{label}</span>
                </Link>
              );
            })}
            <NotificationBell variant="bottom" />
            <Link
              to={`/profile/${user.id}`}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                location.pathname.startsWith("/profile")
                  ? "text-primary font-semibold"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="max-w-full truncate">Profile</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
