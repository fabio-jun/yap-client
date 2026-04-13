import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../api/notificationApi";
import NotificationDropdown from "./NotificationDropdown";

interface NotificationBellProps {
  variant?: "sidebar" | "bottom";
}

export default function NotificationBell({ variant = "sidebar" }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const fetchCount = useCallback(async () => {
    try {
      const res = await getUnreadCount();
      setUnreadCount(res.data);
    } catch {
      // Polling will retry.
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(fetchCount, 0);
    const interval = setInterval(fetchCount, 30000);
    return () => {
      window.clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [fetchCount]);

  if (variant === "bottom") {
    const active = location.pathname.startsWith("/notifications");

    return (
      <Link
        to="/notifications"
        className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors ${
          active ? "text-primary font-semibold" : "text-base-content/60 hover:text-base-content"
        }`}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        <div className="indicator">
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-primary badge-xs text-[0.625rem]" aria-live="polite">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="max-w-full truncate">Alerts</span>
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`btn btn-ghost gap-3 w-12 md:w-full justify-center md:justify-start transition-all duration-200 cursor-pointer ${
          isOpen ? "bg-primary/10 text-primary font-semibold" : "hover:bg-base-200"
        }`}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={isOpen}
      >
        <div className="indicator">
          <Bell className="w-6 h-6" aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="indicator-item badge badge-primary badge-sm text-xs" aria-live="polite">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        <span className="hidden md:inline text-lg">Notifications</span>
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCountChange={fetchCount}
      />
    </div>
  );
}
