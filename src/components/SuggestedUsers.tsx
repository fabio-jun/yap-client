import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSuggestedUsers } from "../api/userApi";
import { toggleFollow } from "../api/followApi";
import type { User } from "../types";

export default function SuggestedUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [followedIds, setFollowedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    getSuggestedUsers()
      .then((res) => setUsers(res.data))
      .catch(() => {});
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

  if (users.length === 0) return null;

  return (
    <div className="card bg-base-200 p-4">
      <h3 className="font-bold text-lg mb-3 text-left">Who to follow</h3>
      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <Link to={`/profile/${u.id}`} className="shrink-0">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full">
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
              <Link to={`/profile/${u.id}`} className="font-semibold text-sm hover:text-primary block truncate">
                {u.userName.charAt(0).toUpperCase() + u.userName.slice(1)}
              </Link>
              <span className="text-xs text-base-content/50">@{u.userName}</span>
            </div>
            <button
              className={`btn btn-sm ${followedIds.has(u.id) ? "btn-outline" : "btn-primary"}`}
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
