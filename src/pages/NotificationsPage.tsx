import { useState, useEffect, useCallback } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import {
  getNotifications,
  markAllAsRead,
  deleteNotification,
  type NotificationResponse,
} from "../api/notificationApi";
import NotificationItem from "../components/NotificationItem";

const tabs = ["all", "like", "comment", "follow"] as const;
type TabType = (typeof tabs)[number];

const tabLabels: Record<TabType, string> = {
  all: "All",
  like: "Likes",
  comment: "Comments",
  follow: "Follows",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("all");

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

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = async (id: number) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4 gap-3">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="btn btn-ghost btn-sm gap-1 text-primary cursor-pointer"
        >
          <CheckCheck className="w-4 h-4" aria-hidden="true" />
          Mark all read
        </button>
      </div>

      <div className="tabs tabs-bordered mb-4" role="tablist" aria-label="Notification filters">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`tab cursor-pointer ${activeTab === tab ? "tab-active" : ""}`}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      <div className="space-y-1" aria-live="polite">
        {loading && notifications.length === 0 ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-base-300" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-base-300 rounded w-3/4" />
                <div className="h-2 bg-base-300 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-base-content/50 py-12">
            No notifications
          </p>
        ) : (
          filtered.map((n) => (
            <div key={n.id} className="flex items-start group">
              <div className="flex-1 min-w-0">
                <NotificationItem notification={n} onRead={handleRead} />
              </div>
              <button
                type="button"
                onClick={() => handleDelete(n.id)}
                className="btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity mt-3 mr-1 cursor-pointer"
                title="Delete notification"
                aria-label="Delete notification"
              >
                <Trash2 className="w-4 h-4 text-error" aria-hidden="true" />
              </button>
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
