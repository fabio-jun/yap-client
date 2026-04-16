import { useState } from "react";
import { Link } from "react-router-dom";
import { toggleLike } from "../api/likeApi";
import { useAuth } from "../hooks/useAuth";
import { Heart, MessageCircle, Bookmark, Trash2, Repeat2, PencilLine, Flag, Share2 } from "lucide-react";
import { toggleBookmark } from "../api/bookmarkApi";
import { deletePost } from "../api/postApi";
import { quoteRepost, toggleRepost } from "../api/repostApi";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";
import LikedByModal from "./LikedByModal";
import ReportModal from "./ReportModal";
import type { Post } from "../types";
import { renderContent } from "../utils/renderContent";

interface YapCardProps {
  post: Post;
  onLikeToggle?: (postId: number, liked: boolean, count: number) => void;
  onBookmarkToggle?: (postId: number, bookmarked: boolean) => void;
  onDelete?: (postId: number) => void;
  onRepostToggle?: (postId: number, reposted: boolean, count: number) => void;
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

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export default function YapCard({ post, onLikeToggle, onBookmarkToggle, onDelete, onRepostToggle }: YapCardProps) {
  const { user } = useAuth();
  const isAuthor = user && String(post.authorId) === user.id;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteContent, setQuoteContent] = useState(post.quoteContent || "");
  const [quoteSaving, setQuoteSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [likedByOpen, setLikedByOpen] = useState(false);

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

  const handleSimpleRepost = async () => {
    if (!user) return;
    try {
      const res = await toggleRepost(post.id);
      onRepostToggle?.(post.id, res.data.reposted, res.data.count);
      toast(res.data.reposted ? "Re-yapped!" : "Re-yap removed");
    } catch {
      toast.error("Could not re-yap this yap.");
    } finally {
      setRepostMenuOpen(false);
    }
  };

  const handleQuoteRepost = async () => {
    if (!user || !quoteContent.trim()) return;
    setQuoteSaving(true);
    try {
      const res = await quoteRepost(post.id, quoteContent);
      onRepostToggle?.(post.id, res.data.reposted, res.data.count);
      toast.success("Quote re-yapped!");
      setQuoteOpen(false);
      setRepostMenuOpen(false);
    } catch {
      toast.error("Could not quote re-yap this yap.");
    } finally {
      setQuoteSaving(false);
    }
  };

  const handleShare = async () => {
    const postId = post.originalPostId || post.id;
    const url = `${window.location.origin}/post/${postId}`;

    try {
      await copyText(url);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <>
      <div className="border-b border-base-300 px-4 py-4 hover:bg-base-200/40 transition-colors duration-150">
        <div>

          {/* Simple repost banner — not shown for quote reposts */}
          {post.isRepost && !post.quoteContent && post.repostedByUserName && (
            <div className="flex items-center gap-2 text-xs font-semibold text-base-content/50 mb-2 ml-1">
              <Repeat2 className="w-3.5 h-3.5" />
              <Link to={`/profile/${post.repostedByUserId}`} className="hover:text-primary transition-colors">
                {post.repostedByUserName} re-yapped
              </Link>
            </div>
          )}

          {post.quoteContent ? (
            /* ── Quote repost: reposter header + quote text + embedded original ── */
            <>
              <div className="flex items-start gap-3">
                <Link to={`/profile/${post.repostedByUserId}`} className="shrink-0">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring-2 ring-base-300 transition-all hover:ring-primary">
                      {post.repostedByProfileImageUrl ? (
                        <img src={post.repostedByProfileImageUrl} alt={post.repostedByUserName} />
                      ) : (
                        <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                          {(post.repostedByUserName ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/profile/${post.repostedByUserId}`} className="font-bold hover:text-primary transition-colors truncate">
                      {post.repostedByUserName
                        ? post.repostedByUserName.charAt(0).toUpperCase() + post.repostedByUserName.slice(1)
                        : ""}
                    </Link>
                    <Link to={`/profile/${post.repostedByUserId}`} className="text-base-content/50 text-sm truncate">
                      @{post.repostedByUserName}
                    </Link>
                    <span className="text-base-content/30 text-sm">·</span>
                    <span
                      className="text-sm text-base-content/50 shrink-0 tooltip tooltip-bottom cursor-default"
                      data-tip={fullDate(post.repostedAt ?? post.createdAt)}
                    >
                      {timeAgo(post.repostedAt ?? post.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-base-content leading-relaxed">
                    {renderContent(post.quoteContent, post.mentionedUsers)}
                  </p>
                </div>
              </div>

              {/* Embedded original post */}
              <Link
                to={`/post/${post.id}`}
                className="block mt-3 rounded-xl border border-base-300 p-3 hover:bg-base-300/40 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                    {post.authorProfileImageUrl ? (
                      <img src={post.authorProfileImageUrl} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="bg-primary text-primary-content flex items-center justify-center text-xs font-bold w-full h-full">
                        {post.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-sm">
                    {post.authorName.charAt(0).toUpperCase() + post.authorName.slice(1)}
                  </span>
                  <span className="text-base-content/50 text-xs">@{post.authorName}</span>
                  <span className="text-base-content/30 text-xs">·</span>
                  <span className="text-xs text-base-content/50">{timeAgo(post.createdAt)}</span>
                </div>
                <p className="text-sm text-base-content/80 leading-relaxed line-clamp-3">
                  {renderContent(post.content, post.mentionedUsers)}
                </p>
                {post.imageUrl && (
                  <div className="mt-2">
                    {post.imageUrl.includes("/video/upload/") ? (
                      <video src={post.imageUrl} className="rounded-lg max-h-48 w-full" controls onClick={(e) => e.preventDefault()} />
                    ) : (
                      <img src={post.imageUrl} alt="" className="rounded-lg max-h-48 w-full object-contain" />
                    )}
                  </div>
                )}
              </Link>
            </>
          ) : (
            /* ── Normal / simple repost: original author header + content ── */
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
                  <p className="text-base-content leading-relaxed">{renderContent(post.content, post.mentionedUsers)}</p>
                </Link>
                {post.imageUrl && (
                  <Link to={`/post/${post.id}`} className="block mt-2">
                    {post.imageUrl.includes("/video/upload/") ? (
                      <video src={post.imageUrl} className="rounded-xl max-h-96 w-full" controls onClick={(e) => e.preventDefault()} />
                    ) : (
                      <img src={post.imageUrl} alt="" className="rounded-xl max-h-96 w-full object-contain hover:brightness-90 transition-all duration-200" />
                    )}
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* ── Action buttons (shared for all post types) ── */}
          <div className="flex items-center gap-0 mt-3 -ml-1.5 text-base-content/40">
            <div
              className={`flex items-center rounded-full text-xs font-medium transition-colors duration-150 ${
                post.hasLiked ? "text-error" : "hover:text-error hover:bg-error/8"
              }`}
            >
              <button
                className="flex items-center px-2 py-1.5 rounded-full transition-colors duration-150"
                onClick={handleLike}
                disabled={!user}
                aria-label={post.hasLiked ? "Unlike" : "Like"}
              >
                <Heart className="w-4 h-4" fill={post.hasLiked ? "currentColor" : "none"} />
              </button>
              {post.likeCount > 0 && (
                <button
                  type="button"
                  className="pr-2 py-1.5 -ml-1 rounded-full transition-colors duration-150"
                  onClick={() => setLikedByOpen(true)}
                  aria-label="Show users who liked this yap"
                >
                  {post.likeCount}
                </button>
              )}
            </div>

            <Link
              to={`/post/${post.id}`}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 hover:text-primary hover:bg-primary/8"
            >
              <MessageCircle className="w-4 h-4" />
            </Link>

            <div className="relative">
              <button
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                  post.hasReposted ? "text-success" : "hover:text-success hover:bg-success/8"
                }`}
                onClick={() => setRepostMenuOpen((open) => !open)}
                disabled={!user}
                aria-label={post.hasReposted ? "Re-yap options" : "Re-yap"}
                aria-expanded={repostMenuOpen}
              >
                <Repeat2 className="w-4 h-4" />
                {post.repostCount > 0 && <span>{post.repostCount}</span>}
              </button>
              {repostMenuOpen && (
                <div className="absolute left-0 top-full mt-1 z-30 w-44 rounded-xl border border-base-300 bg-base-100 shadow-xl overflow-hidden animate-scale-in">
                  <button
                    type="button"
                    onClick={handleSimpleRepost}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-base-200 transition-colors cursor-pointer font-medium"
                  >
                    <Repeat2 className="w-4 h-4" />
                    {post.hasReposted ? "Undo re-yap" : "Re-yap"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setQuoteOpen(true); setRepostMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-base-200 transition-colors cursor-pointer font-medium"
                  >
                    <PencilLine className="w-4 h-4" />
                    Quote re-yap
                  </button>
                </div>
              )}
            </div>

            <button
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 ${
                post.hasBookmarked ? "text-primary" : "hover:text-primary hover:bg-primary/8"
              }`}
              onClick={handleBookmark}
              disabled={!user}
              aria-label={post.hasBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <Bookmark className="w-4 h-4" fill={post.hasBookmarked ? "currentColor" : "none"} />
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 hover:text-secondary hover:bg-secondary/8"
              onClick={handleShare}
              aria-label="Copy yap link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            {user && !isAuthor && (
              <button
                type="button"
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-medium transition-colors duration-150 hover:text-error hover:bg-error/8 ml-auto"
                onClick={() => setReportOpen(true)}
                aria-label="Report yap"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
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

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        reportedUserId={post.authorId}
        postId={post.originalPostId || post.id}
      />

      <LikedByModal
        open={likedByOpen}
        postId={post.originalPostId || post.id}
        onClose={() => setLikedByOpen(false)}
      />

      {quoteOpen && (
        <dialog className="modal modal-open" onClick={() => setQuoteOpen(false)}>
          <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-3">Quote re-yap</h3>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              maxLength={280}
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              placeholder="Add your thoughts"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-base-content/40">{quoteContent.length}/280</span>
              <div className="flex gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQuoteOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={quoteSaving || !quoteContent.trim()}
                  onClick={handleQuoteRepost}
                >
                  {quoteSaving ? <span className="loading loading-spinner loading-xs" /> : "Re-yap"}
                </button>
              </div>
            </div>
          </div>
        </dialog>
      )}
    </>
  );
}
