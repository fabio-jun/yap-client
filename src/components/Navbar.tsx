import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Home, User, Bookmark, Mail, ShieldAlert, Star } from "lucide-react";
import NotificationBell from "./NotificationBell";
import { getUserById } from "../api/userApi";
import type { User as UserType } from "../types";
import AvatarFallback from "./AvatarFallback";

function useTheme() {
  const [theme] = useState(() => localStorage.getItem("theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme };
}

const navLinks = [
  { to: "/", icon: Home, label: "Home", match: (p: string) => p === "/" },
  { to: "/bookmarks", icon: Bookmark, label: "Bookmarks", match: (p: string) => p === "/bookmarks" },
  { to: "/messages", icon: Mail, label: "Messages", match: (p: string) => p.startsWith("/messages") },
];

export default function Navbar() {
  const { user } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState<UserType | null>(null);
  useTheme();

  useEffect(() => {
    if (!user) return;
    getUserById(Number(user.id))
      .then((res) => setProfile(res.data))
      .catch(() => {});
  }, [user]);

  if (!user) {
    return (
      <div className="border-b border-base-300">
        <div className="relative flex h-[68px] w-full items-center justify-between px-[30px]">
          <Link to="/" className="font-brand text-[1.5rem] font-extrabold tracking-tight text-base-content">
            Yap<span className="text-primary">.</span>
          </Link>

          {location.pathname === "/" ? (
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-ghost h-10 rounded-[10px] border border-base-300 px-5 text-sm font-semibold text-base-content shadow-none">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary h-10 rounded-[10px] border-none px-5 text-sm font-semibold shadow-none">
                Get started
              </Link>
            </div>
          ) : (
            <div className="w-24" />
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-base-300 px-3">
        <div className="sticky top-0 flex min-h-[100vh] flex-col py-5">
          <Link to="/" className="font-brand mb-5 px-3 text-[1.75rem] font-extrabold leading-none tracking-tight text-base-content">
            Yap<span className="text-primary">.</span>
          </Link>

          <div className="space-y-0.5">
            {navLinks.map(({ to, icon: Icon, label, match }) => {
              const active = match(location.pathname);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex w-full items-center gap-[14px] rounded-[14px] px-[14px] py-[11px] text-[1rem] transition-colors duration-150 ${
                    active
                      ? "bg-primary/12 font-semibold text-primary"
                      : "text-base-content/58 hover:bg-base-200/70 hover:text-base-content"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
            <NotificationBell />
            <Link
              to="/premium"
              className={`flex w-full items-center gap-[14px] rounded-[14px] px-[14px] py-[11px] text-[1rem] transition-colors duration-150 ${
                location.pathname === "/premium"
                  ? "bg-primary/12 font-semibold text-primary"
                  : "text-base-content/58 hover:bg-base-200/70 hover:text-base-content"
              }`}
            >
              <Star className="h-5 w-5" />
              <span>Premium</span>
            </Link>
            {user.role === "Admin" && (
              <Link
                to="/admin/reports"
                className={`flex w-full items-center gap-[14px] rounded-[14px] px-[14px] py-[11px] text-[1rem] transition-colors duration-150 ${
                  location.pathname.startsWith("/admin/reports")
                    ? "bg-primary/12 font-semibold text-primary"
                    : "text-base-content/58 hover:bg-base-200/70 hover:text-base-content"
                }`}
              >
                <ShieldAlert className="h-5 w-5" />
                <span>Reports</span>
              </Link>
            )}
            <Link
              to={`/profile/${user.id}`}
              className={`flex w-full items-center gap-[14px] rounded-[14px] px-[14px] py-[11px] text-[1rem] transition-colors duration-150 ${
                location.pathname.startsWith("/profile")
                  ? "bg-primary/12 font-semibold text-primary"
                  : "text-base-content/58 hover:bg-base-200/70 hover:text-base-content"
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>

          <div className="mt-auto w-full space-y-4 pt-4">
            <Link
              to="/"
              className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-primary px-5 py-[13px] text-[15px] font-bold text-primary-content transition-opacity duration-150 hover:opacity-88"
            >
              Yap something
            </Link>

            {profile && (
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center gap-3 rounded-[14px] px-3 py-[10px] transition-colors hover:bg-base-200/70"
              >
                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  {profile.profileImageUrl ? (
                    <img src={profile.profileImageUrl} alt={profile.userName} className="h-full w-full object-cover" />
                  ) : (
                    <AvatarFallback label={profile.userName} className="text-[14px]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-base-content">
                    {profile.displayName || profile.userName}
                  </div>
                  <div className="truncate text-[12px] text-base-content/50">@{profile.userName}</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile bottom tabs */}
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
              to="/premium"
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
                location.pathname === "/premium"
                  ? "text-primary font-semibold"
                  : "text-base-content/60 hover:text-base-content"
              }`}
            >
              <Star className="w-5 h-5" />
              <span className="max-w-full truncate">Premium</span>
            </Link>
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
    </>
  );
}
