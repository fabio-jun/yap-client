import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, X } from "lucide-react";
import { getLikedUsers, type LikedUserResponse } from "../api/likeApi";
import AvatarFallback from "./AvatarFallback";

interface LikedByModalProps {
  open: boolean;
  postId: number;
  onClose: () => void;
}

export default function LikedByModal({ open, postId, onClose }: LikedByModalProps) {
  const [users, setUsers] = useState<LikedUserResponse[]>([]);
  const [loadedPostId, setLoadedPostId] = useState<number | null>(null);
  const loading = open && loadedPostId !== postId;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    getLikedUsers(postId)
      .then((res) => {
        if (!cancelled) {
          setUsers(res.data);
          setLoadedPostId(postId);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUsers([]);
          setLoadedPostId(postId);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [open, postId]);

  if (!open) return null;

  return (
    <dialog className="modal modal-open" onClick={onClose}>
      <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Liked by</h3>
          <button type="button" className="btn btn-sm btn-circle btn-ghost cursor-pointer" onClick={onClose} aria-label="Close liked by list">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-base-300" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-base-300 rounded w-1/2" />
                  <div className="h-2 bg-base-300 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="w-10 h-10 mx-auto text-base-content/30 mb-3" />
            <p className="text-sm text-base-content/50">No likes yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {users.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-base-200 transition-colors cursor-pointer"
                onClick={onClose}
              >
                <div className="avatar">
                  <div className="w-10 rounded-full ring-2 ring-base-300">
                    {user.profileImageUrl ? (
                      <img src={user.profileImageUrl} alt={user.userName} />
                    ) : (
                      <AvatarFallback label={user.userName} className="text-sm" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="font-semibold block text-sm truncate">
                    {user.displayName || user.userName.charAt(0).toUpperCase() + user.userName.slice(1)}
                  </span>
                  <span className="text-xs text-base-content/50 truncate">@{user.userName}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
}
