import { useState, useEffect, useCallback } from "react";
import {
  getNotifications,
  type NotificationResponse,
} from "../api/notificationApi";
import NotificationItem from "../components/NotificationItem";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = useCallback(async (pageNum: number, append = false) => {
    setLoading(true);
    try {
      const res = await getNotifications(pageNum, 20);
      const data = res.data;
      setNotifications((prev) => (append ? [...prev, ...data.items] : data.items));
      setHasMore(pageNum < data.totalPages);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const handleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="border-b border-base-300 px-4 pb-4 pt-3">
        <h1 className="text-[1.5rem] font-bold tracking-tight">Notifications</h1>
      </div>

      <div aria-live="polite">
        {loading && notifications.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-base-300 p-4 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-base-300" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-base-300 rounded w-3/4" />
                <div className="h-2 bg-base-300 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <p className="py-12 text-center text-base-content/50">No notifications</p>
        ) : (
          notifications.map((n) => (
            <div key={n.id} className="border-b border-base-300 last:border-b-0">
              <NotificationItem notification={n} onRead={handleRead} />
            </div>
          ))
        )}
      </div>

      {hasMore && !loading && (
        <div className="flex justify-center mt-4">
          <button type="button" onClick={handleLoadMore} className="btn btn-ghost btn-sm text-primary cursor-pointer">
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
