import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { CheckCheck } from "lucide-react";
import { getRecentNotifications, markAllAsRead, type NotificationResponse } from "../api/notificationApi";
import NotificationItem from "./NotificationItem";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onCountChange?: () => void;
}

export default function NotificationDropdown({ isOpen, onClose, onCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      let active = true;
      const timeout = window.setTimeout(() => {
        setLoading(true);
        getRecentNotifications(8)
          .then((res) => {
            if (active) setNotifications(res.data);
          })
          .finally(() => {
            if (active) setLoading(false);
          });
      }, 0);

      return () => {
        active = false;
        window.clearTimeout(timeout);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onCountChange?.();
  };

  const handleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    onCountChange?.();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute left-full ml-2 top-0 w-80 max-w-[calc(100vw-5rem)] bg-base-100 border border-base-300 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-label="Notifications"
    >
      <div className="flex items-center justify-between p-3 border-b border-base-300">
        <h3 className="font-semibold text-sm">Notifications</h3>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="btn btn-ghost btn-xs gap-1 text-primary cursor-pointer"
          title="Mark all as read"
        >
          <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Mark all read</span>
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto" aria-live="polite">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-base-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-base-300 rounded w-3/4" />
                  <div className="h-2 bg-base-300 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <p className="p-6 text-center text-sm text-base-content/50">
            No notifications yet
          </p>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} onRead={handleRead} />
          ))
        )}
      </div>

      <div className="border-t border-base-300 p-2">
        <Link
          to="/notifications"
          onClick={onClose}
          className="btn btn-ghost btn-sm w-full text-primary cursor-pointer"
        >
          See all notifications
        </Link>
      </div>
    </div>
  );
}
