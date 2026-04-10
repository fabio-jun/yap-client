import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedUsers } from "../api/userApi";
import { toggleFollow } from "../api/followApi";
import type { User } from "../types";

function SuggestedUsersSkeleton() {
  return (
    <div className="card bg-base-200 p-4 animate-pulse">
      <div className="h-5 w-28 bg-base-300 rounded mb-3" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-base-300 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-20 bg-base-300 rounded" />
              <div className="h-3 w-16 bg-base-300 rounded" />
            </div>
            <div className="h-8 w-16 bg-base-300 rounded-lg" />
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
    <div className="card bg-base-200 p-4">
      <h3 className="font-bold text-lg mb-3 text-left">Who to follow</h3>
      <div className="flex flex-col gap-3 animate-stagger">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <Link to={`/profile/${u.id}`} className="shrink-0">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all">
                  {u.profileImageUrl ? (
                    <img src={u.profileImageUrl} alt={u.userName} />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                      {u.userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u.id}`} className="font-semibold text-sm hover:text-primary transition-colors block truncate">
                {u.displayName || u.userName.charAt(0).toUpperCase() + u.userName.slice(1)}
              </Link>
              <span className="text-xs text-base-content/50">@{u.userName}</span>
            </div>
            <button
              className={`btn btn-sm transition-all duration-200 ${followedIds.has(u.id) ? "btn-ghost text-base-content/60" : "btn-primary shadow-sm shadow-primary/20"}`}
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
