import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Heart, MessageCircle, PencilLine, Repeat2, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { toggleLike } from "../api/likeApi";
import { toggleBookmark } from "../api/bookmarkApi";
import { deletePost } from "../api/postApi";
import { quoteRepost, toggleRepost } from "../api/repostApi";
import { useAuth } from "../hooks/useAuth";
import ConfirmModal from "./ConfirmModal";
import LikedByModal from "./LikedByModal";
import AvatarFallback from "./AvatarFallback";
import type { Post } from "../types";
import { renderContent } from "../utils/renderContent";
import { isVideoUrl } from "../utils/isVideoUrl";

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

function Avatar({
  imageUrl,
  label,
  sizeClass = "h-10 w-10",
}: {
  imageUrl?: string;
  label: string;
  sizeClass?: string;
}) {
  return (
    <div className={`overflow-hidden rounded-full ${sizeClass}`}>
      {imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <AvatarFallback label={label} className="text-sm" />
      )}
    </div>
  );
}

function ActionButton({
  active,
  activeClassName,
  className,
  disabled,
  label,
  onClick,
  count,
  children,
}: {
  active?: boolean;
  activeClassName: string;
  className?: string;
  disabled?: boolean;
  label: string;
  onClick?: () => void;
  count?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-1 rounded-full px-1.5 py-1 text-[13px] font-medium transition-colors duration-150 ${
        active ? activeClassName : "text-base-content/44 hover:bg-base-200 hover:text-base-content/80"
      } ${className ?? ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {children}
      {count && count > 0 ? <span>{count}</span> : null}
    </button>
  );
}

export default function YapCard({
  post,
  onLikeToggle,
  onBookmarkToggle,
  onDelete,
  onRepostToggle,
}: YapCardProps) {
  const { user } = useAuth();
  const isAuthor = user && String(post.authorId) === user.id;
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [likedByOpen, setLikedByOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteContent, setQuoteContent] = useState(post.quoteContent || "");
  const [quoteSaving, setQuoteSaving] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
      toast.success("Yap deleted!");
    } catch {
      toast.error("Failed to delete yap.");
    } finally {
      setConfirmDelete(false);
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

    try {
      await copyText(`${window.location.origin}/post/${postId}`);
      toast.success("Link copied.");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  return (
    <>
      <div className="border-b border-base-300 px-4 py-4 transition-colors duration-150 hover:bg-base-200/20">
        {post.isRepost && !post.quoteContent && post.repostedByUserName ? (
          <div className="mb-1.5 ml-[52px] flex items-center gap-2 text-[12px] font-semibold text-base-content/44">
            <Repeat2 className="h-3.5 w-3.5" />
            <Link to={`/profile/${post.repostedByUserId}`} className="transition-colors hover:text-primary">
              {post.repostedByUserName} re-yapped
            </Link>
          </div>
        ) : null}

        <div className="flex items-start gap-3">
          <Link to={`/profile/${post.quoteContent ? post.repostedByUserId : post.authorId}`} className="shrink-0">
            <Avatar
              imageUrl={post.quoteContent ? post.repostedByProfileImageUrl : post.authorProfileImageUrl}
              label={post.quoteContent ? (post.repostedByUserName ?? "?") : post.authorName}
            />
          </Link>

          <div className="min-w-0 flex-1">
            {post.quoteContent ? (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/profile/${post.repostedByUserId}`} className="truncate text-[14px] font-bold tracking-tight transition-colors hover:text-primary">
                    {post.repostedByUserName}
                  </Link>
                  <span className="truncate text-[13px] text-base-content/50">@{post.repostedByUserName}</span>
                  <span className="text-base-content/30">·</span>
                  <span className="tooltip tooltip-bottom cursor-default text-[13px] text-base-content/42" data-tip={fullDate(post.repostedAt ?? post.createdAt)}>
                    {timeAgo(post.repostedAt ?? post.createdAt)}
                  </span>
                  {isAuthor ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle ml-auto text-base-content/30 transition-colors hover:text-error"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                <p className="mt-1 text-[15px] leading-relaxed text-base-content">
                  {renderContent(post.quoteContent, post.mentionedUsers)}
                </p>

                <Link
                  to={`/post/${post.id}`}
                  className="mt-3 block rounded-[14px] border border-base-300 p-3 transition-colors hover:bg-base-300/20"
                >
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <Avatar imageUrl={post.authorProfileImageUrl} label={post.authorName} sizeClass="h-5 w-5" />
                    <span className="text-sm font-bold text-base-content">{post.authorName}</span>
                    <span className="text-xs text-base-content/50">@{post.authorName}</span>
                    <span className="text-xs text-base-content/30">·</span>
                    <span className="text-xs text-base-content/42">{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-base-content/80 line-clamp-3">
                    {renderContent(post.content, post.mentionedUsers)}
                  </p>
                  {post.imageUrl ? (
                    <div className="mt-2">
                      {isVideoUrl(post.imageUrl) ? (
                      <video src={post.imageUrl} className="max-h-48 w-full rounded-[12px]" controls onClick={(e) => e.preventDefault()} />
                    ) : (
                      <img src={post.imageUrl} alt="" className="max-h-48 w-full rounded-[12px] object-contain" />
                    )}
                  </div>
                ) : null}
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/profile/${post.authorId}`} className="truncate text-[14px] font-bold tracking-tight transition-colors hover:text-primary">
                    {post.authorName}
                  </Link>
                  <span className="truncate text-[13px] text-base-content/50">@{post.authorName}</span>
                  <span className="text-base-content/30">·</span>
                  <span className="tooltip tooltip-bottom cursor-default text-[13px] text-base-content/42" data-tip={fullDate(post.createdAt)}>
                    {timeAgo(post.createdAt)}
                  </span>
                  {isAuthor ? (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle ml-auto text-base-content/30 transition-colors hover:text-error"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>

                <Link to={`/post/${post.id}`} className="mt-1 block">
                  <p className="text-[15px] leading-relaxed text-base-content">
                    {renderContent(post.content, post.mentionedUsers)}
                  </p>
                </Link>

                {post.imageUrl ? (
                  <Link to={`/post/${post.id}`} className="mt-3 block">
                    {isVideoUrl(post.imageUrl) ? (
                      <video src={post.imageUrl} className="max-h-96 w-full rounded-[14px]" controls onClick={(e) => e.preventDefault()} />
                    ) : (
                      <img src={post.imageUrl} alt="" className="max-h-96 w-full rounded-[14px] object-contain transition-all duration-150 hover:brightness-95" />
                    )}
                  </Link>
                ) : null}
              </>
            )}

            <div className="mt-2.5 flex items-center gap-0.5 -ml-1">
              <div className="flex items-center">
                <ActionButton
                  active={post.hasLiked}
                  activeClassName="text-error hover:bg-error/10 hover:text-error"
                  disabled={!user}
                  label={post.hasLiked ? "Unlike" : "Like"}
                  onClick={handleLike}
                >
                  <Heart className="h-4 w-4" fill={post.hasLiked ? "currentColor" : "none"} />
                </ActionButton>
                {post.likeCount > 0 ? (
                  <button
                    type="button"
                    className={`-ml-0.5 rounded-full py-1 pr-2 text-[13px] font-medium transition-colors ${
                      post.hasLiked ? "text-error" : "text-base-content/44 hover:text-base-content/80"
                    }`}
                    onClick={() => setLikedByOpen(true)}
                  >
                    {post.likeCount}
                  </button>
                ) : null}
              </div>

              <Link
                to={`/post/${post.id}`}
                className="flex items-center gap-1 rounded-full px-1.5 py-1 text-[13px] font-medium text-base-content/44 transition-colors hover:bg-base-200 hover:text-base-content/80"
              >
                <MessageCircle className="h-4 w-4" />
                {post.commentCount > 0 ? <span>{post.commentCount}</span> : null}
              </Link>

              <div className="relative">
                <ActionButton
                  active={post.hasReposted}
                  activeClassName="text-success hover:bg-success/10 hover:text-success"
                  disabled={!user}
                  label={post.hasReposted ? "Re-yap options" : "Re-yap"}
                  onClick={() => setRepostMenuOpen((open) => !open)}
                  count={post.repostCount}
                >
                  <Repeat2 className="h-4 w-4" />
                </ActionButton>

                {repostMenuOpen ? (
                  <div className="absolute left-0 top-full z-30 mt-1 w-44 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                    <button
                      type="button"
                      onClick={handleSimpleRepost}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
                    >
                      <Repeat2 className="h-4 w-4" />
                      {post.hasReposted ? "Undo re-yap" : "Re-yap"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuoteOpen(true);
                        setRepostMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-base-200"
                    >
                      <PencilLine className="h-4 w-4" />
                      Quote re-yap
                    </button>
                  </div>
                ) : null}
              </div>

              <ActionButton
                active={post.hasBookmarked}
                activeClassName="text-primary hover:bg-primary/10 hover:text-primary"
                disabled={!user}
                label={post.hasBookmarked ? "Remove bookmark" : "Bookmark"}
                onClick={handleBookmark}
              >
                <Bookmark className="h-4 w-4" fill={post.hasBookmarked ? "currentColor" : "none"} />
              </ActionButton>

              <ActionButton
                activeClassName="text-primary hover:bg-primary/10 hover:text-primary"
                className="ml-auto"
                label="Copy yap link"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4" />
              </ActionButton>
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

      <LikedByModal
        open={likedByOpen}
        postId={post.originalPostId || post.id}
        onClose={() => setLikedByOpen(false)}
      />

      {quoteOpen ? (
        <dialog className="modal modal-open" onClick={() => setQuoteOpen(false)}>
          <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="mb-3 text-lg font-bold">Quote re-yap</h3>
            <textarea
              className="textarea textarea-bordered w-full"
              rows={4}
              maxLength={280}
              value={quoteContent}
              onChange={(e) => setQuoteContent(e.target.value)}
              placeholder="Add your thoughts"
            />
            <div className="mt-2 flex items-center justify-between">
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
      ) : null}
    </>
  );
}
