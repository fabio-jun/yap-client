import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { markAsRead, type NotificationResponse } from "../api/notificationApi";

interface NotificationItemProps {
  notification: NotificationResponse;
  onRead?: (id: number) => void;
}

const typeConfig = {
  like: { icon: Heart, color: "text-red-500", verb: "liked your yap" },
  comment: { icon: MessageCircle, color: "text-blue-500", verb: "commented on your yap" },
  follow: { icon: UserPlus, color: "text-green-500", verb: "started following you" },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const config = typeConfig[notification.type];
  const Icon = config.icon;
  const displayName = notification.actorDisplayName || notification.actorUsername;

  const handleClick = async () => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      onRead?.(notification.id);
    }

    if (notification.type === "follow") {
      navigate(`/profile/${notification.actorId}`);
    } else if (notification.postId) {
      navigate(`/post/${notification.postId}`);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full cursor-pointer flex items-start gap-3 p-3 rounded-lg text-left transition-colors duration-200 hover:bg-base-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
        !notification.isRead ? "bg-primary/5" : ""
      }`}
    >
      <div className="avatar shrink-0">
        <div className="w-10 rounded-full ring ring-base-300">
          <img
            src={notification.actorProfileImageUrl || `https://ui-avatars.com/api/?name=${notification.actorUsername}`}
            alt={notification.actorUsername}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm">
          <span className="font-semibold">{displayName}</span>{" "}
          <span className="text-base-content/70">{config.verb}</span>
        </p>
        {notification.postContentPreview && (
          <p className="text-xs text-base-content/50 truncate mt-0.5">
            {notification.postContentPreview}
          </p>
        )}
        <p className="text-xs text-base-content/40 mt-1 flex items-center gap-1">
          <Icon className={`w-3 h-3 ${config.color}`} aria-hidden="true" />
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" aria-label="Unread" />
      )}
    </button>
  );
}
