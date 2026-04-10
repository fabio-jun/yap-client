import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getConversations } from "../api/messageApi";
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
    <div className="flex flex-col gap-1 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-base-200">
          <div className="w-12 h-12 rounded-full bg-base-300 shrink-0" />
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
      <h2 className="text-2xl font-bold mb-4">Messages</h2>

      {loading ? (
        <MessagesSkeleton />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-12 h-12" />}
          title="No messages yet"
          description="Send a message from someone's profile to start a conversation."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {conversations.map((conv) => (
            <Link
              key={conv.userId}
              to={`/messages/${conv.userId}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-base-200 hover:bg-base-300/50 transition-colors duration-200 cursor-pointer"
            >
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring-2 ring-base-300">
                  {conv.profileImageUrl ? (
                    <img src={conv.profileImageUrl} alt={conv.userName} />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-lg font-bold w-full h-full">
                      {conv.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold">@{conv.userName}</span>
                  <span className="text-xs text-base-content/40">{timeAgo(conv.lastMessageDate)}</span>
                </div>
                <p className="text-sm text-base-content/50 truncate">{conv.lastMessageContent}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
