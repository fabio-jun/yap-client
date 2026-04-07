import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Search, Home, User, Bookmark } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  const isHome = location.pathname === "/";

  return (
    <>
      <div className="navbar bg-base-200 border-b border-base-300 sticky top-0 z-50">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl font-extrabold text-primary">
            Yap
          </Link>
        </div>

        {user && (
          <div className="flex-none gap-2">
            <form onSubmit={handleSearch} className="flex items-center">
              <label className="input input-bordered input-sm w-40 md:w-64 flex items-center gap-2">
                <Search className="w-4 h-4 text-base-content/40 shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="grow bg-transparent outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
            </form>
          </div>
        )}
      </div>

      {user && (
        <div className="fixed left-0 top-16 bottom-0 w-16 md:w-56 flex flex-col items-center md:items-start gap-1 pt-4 md:pl-4 z-40">
          <Link
            to="/"
            className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start ${isHome ? "text-primary" : ""}`}
          >
            <Home className="w-6 h-6" />
            <span className="hidden md:inline text-lg">Home</span>
          </Link>
          <Link
            to="/bookmarks"
            className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start ${location.pathname === "/bookmarks" ? "text-primary" : ""}`}
          >
            <Bookmark className="w-6 h-6" />
            <span className="hidden md:inline text-lg">Bookmarks</span>
          </Link>
          <Link
            to={`/profile/${user.id}`}
            className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start ${location.pathname.startsWith("/profile") ? "text-primary" : ""}`}
          >
            <User className="w-6 h-6" />
            <span className="hidden md:inline text-lg">Profile</span>
          </Link>
        </div>
      )}
    </>
  );
}
