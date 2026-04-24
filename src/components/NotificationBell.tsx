import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { getUnreadCount } from "../api/notificationApi";

interface NotificationBellProps {
  variant?: "sidebar" | "bottom";
}

export default function NotificationBell({ variant = "sidebar" }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
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
        <span className="max-w-full truncate">Notifications</span>
      </Link>
    );
  }

  return (
    <Link
      to="/notifications"
      className={`flex w-full items-center gap-[14px] rounded-[14px] px-[14px] py-[11px] text-[1rem] transition-colors duration-150 ${
        location.pathname.startsWith("/notifications")
          ? "bg-primary/12 font-semibold text-primary"
          : "text-base-content/58 hover:bg-base-200/70 hover:text-base-content"
      }`}
      aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
    >
      <Bell className="h-5 w-5" aria-hidden="true" />
      <span>Notifications</span>
      {unreadCount > 0 && (
        <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-content" aria-live="polite">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
