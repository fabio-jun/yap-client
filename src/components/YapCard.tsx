import { Link } from "react-router-dom";
import { toggleLike } from "../api/likeApi";
import { useAuth } from "../contexts/AuthContext";
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import { toggleBookmark } from "../api/bookmarkApi";
import { deletePost } from "../api/postApi";
import toast from "react-hot-toast";
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
        <Link key={i} to={`/search?tag=${tag}`} className="link link-primary font-semibold">
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

export default function YapCard({ post, onLikeToggle, onBookmarkToggle, onDelete }: YapCardProps) {
  const { user } = useAuth();
  const isAuthor = user && String(post.authorId) === user.id;

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
      toast.success("Yap deleted!");
    } catch {
      toast.error("Failed to delete yap.");
    }
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
    <div className="card bg-base-200 mb-3 hover:bg-base-300 transition-colors">
      <div className="card-body p-4">
        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.authorId}`} className="shrink-0">
            <div className="avatar">
              <div className="w-10 h-10 rounded-full">
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
              <Link to={`/profile/${post.authorId}`} className="font-bold hover:text-primary truncate">
                {post.authorName.charAt(0).toUpperCase() + post.authorName.slice(1)}
              </Link>
              <Link to={`/profile/${post.authorId}`} className="text-base-content/50 text-sm truncate">
                @{post.authorName}
              </Link>
              <span className="text-base-content/30 text-sm">·</span>
              <span className="text-sm text-base-content/50 shrink-0">{timeAgo(post.createdAt)}</span>
              {isAuthor && (
                <button
                  className="btn btn-ghost btn-xs btn-circle ml-auto text-base-content/30 hover:text-error"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Link to={`/post/${post.id}`} className="mt-1 block hover:no-underline">
              <p className="text-base-content">{formatHashtags(post.content)}</p>
            </Link>

            {post.imageUrl && (
              <img src={post.imageUrl} alt="" className="rounded-xl mt-2 max-h-96 w-full object-cover" />
            )}

            <div className="flex gap-4 mt-2">
              <button
                className={`btn btn-ghost btn-sm gap-1 ${post.hasLiked ? "text-error" : ""}`}
                onClick={handleLike}
                disabled={!user}
              >
                <Heart className="w-4 h-4" fill={post.hasLiked ? "currentColor" : "none"} /> {post.likeCount}
              </button>
              <Link to={`/post/${post.id}`} className="btn btn-ghost btn-sm gap-1">
                <MessageCircle className="w-4 h-4" />
              </Link>
              <button
                className={`btn btn-ghost btn-sm gap-1 ${post.hasBookmarked ? "text-primary" : ""}`}
                onClick={handleBookmark}
                disabled={!user}
              >
                <Bookmark className="w-4 h-4" fill={post.hasBookmarked ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
