import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedUsers } from "../api/userApi";
import { toggleFollow } from "../api/followApi";
import type { User } from "../types";
import AvatarFallback from "./AvatarFallback";

function SuggestedUsersSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[14px] border border-base-300 bg-base-200">
      <div className="border-b border-base-300 px-4 pb-[10px] pt-[14px]">
        <div className="h-4 w-28 rounded bg-base-300" />
      </div>
      <div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-base-300 px-4 py-[10px] last:border-b-0">
            <div className="h-9 w-9 shrink-0 rounded-full bg-base-300" />
            <div className="flex-1 space-y-1">
              <div className="h-3.5 w-20 rounded bg-base-300" />
              <div className="h-3 w-16 rounded bg-base-300" />
            </div>
            <div className="h-7 w-[70px] rounded-[10px] bg-base-300" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SuggestedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSuggestedUsers()
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleFollow = async (userId: number) => {
    await toggleFollow(userId);
    setFollowedIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  if (loading) return <SuggestedUsersSkeleton />;
  if (users.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-[14px] border border-base-300 bg-base-200">
      <h3 className="border-b border-base-300 px-4 pb-[10px] pt-[14px] text-[1rem] font-bold tracking-tight text-base-content">
        Who to follow
      </h3>
      <div className="animate-stagger">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3 border-b border-base-300 px-4 py-[10px] last:border-b-0">
            <Link to={`/profile/${u.id}`} className="shrink-0">
              <div className="avatar">
                <div className="h-9 w-9 rounded-full overflow-hidden">
                  {u.profileImageUrl ? (
                    <img src={u.profileImageUrl} alt={u.userName} />
                  ) : (
                    <AvatarFallback label={u.userName} className="text-[13px]" />
                  )}
                </div>
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.id}`} className="block truncate text-[13px] font-bold transition-colors hover:text-primary">
                {u.displayName || u.userName.charAt(0).toUpperCase() + u.userName.slice(1)}
              </Link>
              <span className="block truncate text-xs text-base-content/50">@{u.userName}</span>
            </div>
            <button
              className={`btn h-7 min-h-0 rounded-[10px] border-none px-4 text-xs font-bold shadow-none transition-colors duration-150 ${
                followedIds.has(u.id) ? "bg-base-300 text-base-content/60" : "btn-primary"
              }`}
              onClick={() => handleFollow(u.id)}
            >
              {followedIds.has(u.id) ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
