import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConversations } from "../api/messageApi";
import AvatarFallback from "../components/AvatarFallback";
import EmptyState from "../components/EmptyState";
import { Mail } from "lucide-react";
import type { ConversationPreview } from "../types";

function timeAgo(dateStr: string) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function MessagesSkeleton() {
  return (
    <div className="animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-base-300 px-4 py-4">
          <div className="h-12 w-12 rounded-full bg-base-300 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-base-300 rounded" />
              <div className="h-3 w-8 bg-base-300 rounded" />
            </div>
            <div className="h-3 w-3/4 bg-base-300 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversations()
      .then((res) => setConversations(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="border-b border-base-300 px-4 pb-4 pt-3">
        <h2 className="text-[1.5rem] font-bold tracking-tight">Messages</h2>
      </div>

      {loading ? (
        <div className="mt-3">
          <MessagesSkeleton />
        </div>
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-12 h-12" />}
          title="No messages yet"
          description="Send a message from someone's profile to start a conversation."
        />
      ) : (
        <div className="mt-1">
          {conversations.map((conv, index) => (
            <Link
              key={conv.userId}
              to={`/messages/${conv.userId}`}
              className="flex cursor-pointer items-center gap-3 border-b border-base-300 px-4 py-4 transition-colors duration-200 hover:bg-base-200/25"
            >
              <div className="avatar relative">
                <div className="w-12 h-12 rounded-full">
                  {conv.profileImageUrl ? (
                    <img src={conv.profileImageUrl} alt={conv.userName} />
                  ) : (
                    <AvatarFallback label={conv.userName} className="text-lg" />
                  )}
                </div>
                {index < 2 && <div className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-primary" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-[14px] font-bold text-base-content">{conv.userName}</span>
                  <span className="text-[13px] text-base-content/40">{timeAgo(conv.lastMessageDate)}</span>
                </div>
                <p className="truncate text-[15px] text-base-content/64">{conv.lastMessageContent}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
