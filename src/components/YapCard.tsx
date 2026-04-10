import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleLike } from "../api/likeApi";
import { useAuth } from "../contexts/AuthContext";
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import { toggleBookmark } from "../api/bookmarkApi";
import { deletePost } from "../api/postApi";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import type { Post } from "../types";

interface YapCardProps {
  post: Post;
  onLikeToggle?: (postId: number, liked: boolean, count: number) => void;
  onBookmarkToggle?: (postId: number, bookmarked: boolean) => void;
  onDelete?: (postId: number) => void;
}

function formatHashtags(content: string) {
  const parts = content.split(/(#\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith("#")) {
      const tag = part.slice(1).toLowerCase();
      return (
        <Link key={i} to={`/search?tag=${tag}`} className="text-primary font-semibold hover:underline">
          {part}
        </Link>
      );
    }
    return part;
  });
}

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

function fullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString();
}

export default function YapCard({ post, onLikeToggle, onBookmarkToggle, onDelete }: YapCardProps) {
  const { user } = useAuth();
  const isAuthor = user && String(post.authorId) === user.id;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
      toast.success("Yap deleted!");
    } catch {
      toast.error("Failed to delete yap.");
    }
    setConfirmDelete(false);
  };

  const handleLike = async () => {
    if (!user) return;
    const res = await toggleLike(post.id);
    onLikeToggle?.(post.id, res.data.liked, res.data.count);
  };

  const handleBookmark = async () => {
    if (!user) return;
    const res = await toggleBookmark(post.id);
    onBookmarkToggle?.(post.id, res.data.bookmarked);
    toast(res.data.bookmarked ? "Bookmarked!" : "Removed from bookmarks");
  };

  return (
    <>
      <div className="card bg-base-200 mb-3 hover:bg-base-300/50 transition-colors duration-200">
        <div className="card-body p-4">
          <div className="flex items-start gap-3">
            <Link to={`/profile/${post.authorId}`} className="shrink-0">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full ring-2 ring-base-300 transition-all hover:ring-primary">
                  {post.authorProfileImageUrl ? (
                    <img src={post.authorProfileImageUrl} alt={post.authorName} />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link to={`/profile/${post.authorId}`} className="font-bold hover:text-primary transition-colors truncate">
                  {post.authorName.charAt(0).toUpperCase() + post.authorName.slice(1)}
                </Link>
                <Link to={`/profile/${post.authorId}`} className="text-base-content/50 text-sm truncate">
                  @{post.authorName}
                </Link>
                <span className="text-base-content/30 text-sm">·</span>
                <span className="text-sm text-base-content/50 shrink-0 tooltip tooltip-bottom cursor-default" data-tip={fullDate(post.createdAt)}>
                  {timeAgo(post.createdAt)}
                </span>
                {isAuthor && (
                  <button
                    className="btn btn-ghost btn-xs btn-circle ml-auto text-base-content/30 hover:text-error transition-colors"
                    onClick={() => setConfirmDelete(true)}
                    aria-label="Delete yap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <Link to={`/post/${post.id}`} className="mt-1 block hover:no-underline cursor-pointer">
                <p className="text-base-content leading-relaxed">{formatHashtags(post.content)}</p>
              </Link>

              {post.imageUrl && (
                <Link to={`/post/${post.id}`} className="block mt-2">
                  {post.imageUrl.includes("/video/upload/") ? (
                    <video src={post.imageUrl} className="rounded-xl max-h-96 w-full" controls onClick={(e) => e.preventDefault()} />
                  ) : (
                    <img src={post.imageUrl} alt="" className="rounded-xl max-h-96 w-full object-cover hover:brightness-90 transition-all duration-200" />
                  )}
                </Link>
              )}

              <div className="flex gap-2 mt-2 -ml-2">
                <button
                  className={`btn btn-ghost btn-sm gap-1.5 transition-all duration-200 ${post.hasLiked ? "text-error" : "hover:text-error/70"}`}
                  onClick={handleLike}
                  disabled={!user}
                  aria-label={post.hasLiked ? "Unlike" : "Like"}
                >
                  <Heart className="w-4 h-4" fill={post.hasLiked ? "currentColor" : "none"} />
                  <span className="text-xs">{post.likeCount}</span>
                </button>
                <Link to={`/post/${post.id}`} className="btn btn-ghost btn-sm gap-1.5 hover:text-primary/70 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <button
                  className={`btn btn-ghost btn-sm gap-1.5 transition-all duration-200 ${post.hasBookmarked ? "text-primary" : "hover:text-primary/70"}`}
                  onClick={handleBookmark}
                  disabled={!user}
                  aria-label={post.hasBookmarked ? "Remove bookmark" : "Bookmark"}
                >
                  <Bookmark className="w-4 h-4" fill={post.hasBookmarked ? "currentColor" : "none"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmDelete}
        title="Delete this yap?"
        description="This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  );
}
