import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Repeat2, UserPlus } from "lucide-react";
import { markAsRead, type NotificationResponse } from "../api/notificationApi";

interface NotificationItemProps {
  notification: NotificationResponse;
  onRead?: (id: number) => void;
}

const typeConfig = {
  like: { icon: Heart, badgeColor: "bg-red-500", verb: "liked your yap" },
  comment: { icon: MessageCircle, badgeColor: "bg-green-500", verb: "commented on your yap" },
  reply: { icon: MessageCircle, badgeColor: "bg-green-500", verb: "replied to your yap" },
  follow: { icon: UserPlus, badgeColor: "bg-primary", verb: "started following you" },
  repost: { icon: Repeat2, badgeColor: "bg-purple-500", verb: "re-yapped your yap" },
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
  const config = typeConfig[notification.type] ?? typeConfig.comment;
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
      className={`flex w-full cursor-pointer items-start gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-base-200/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary ${
        !notification.isRead ? "bg-primary/[0.03]" : ""
      }`}
    >
      <div className="relative shrink-0">
        <div className="avatar">
          <div className="w-10 rounded-full ring ring-base-300">
            <img
              src={notification.actorProfileImageUrl || `https://ui-avatars.com/api/?name=${notification.actorUsername}`}
              alt={notification.actorUsername}
            />
          </div>
        </div>
        <div className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-base-100 ${config.badgeColor}`}>
          <Icon className="h-2.5 w-2.5 text-white" aria-hidden="true" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[15px] leading-snug">
          <span className="font-semibold">{displayName}</span>{" "}
          <span className="text-base-content/78">{config.verb}</span>
        </p>
        {notification.postContentPreview && (
          <p className="mt-0.5 truncate text-[13px] italic text-base-content/38">
            "{notification.postContentPreview}"
          </p>
        )}
        <p className="mt-1 text-xs text-base-content/40">{timeAgo(notification.createdAt)}</p>
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" aria-label="Unread" />
      )}
    </button>
  );
}
