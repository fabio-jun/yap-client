import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById, deletePost } from "../api/postApi";
import { toggleLike } from "../api/likeApi";
import { getCommentsByPost, createComment, createReply, deleteComment } from "../api/commentApi";
import { useAuth } from "../hooks/useAuth";
import { Heart, Send, ArrowLeft, Bookmark, Repeat2, Share2, MoreHorizontal, MessageCircle } from "lucide-react";
import AvatarFallback from "../components/AvatarFallback";
import ConfirmModal from "../components/ConfirmModal";
import type { Post, Comment } from "../types";
import { renderContent } from "../utils/renderContent";
import { isVideoUrl } from "../utils/isVideoUrl";

interface CommentItemProps {
  comment: Comment;
  postId: number;
  user: ReturnType<typeof useAuth>["user"];
  depth?: number;
  onReplyCreated: (parentId: number, reply: Comment) => void;
  onConfirmDelete: (commentId: number) => void;
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

function CommentItem({ comment, postId, user, depth = 0, onReplyCreated, onConfirmDelete }: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    const res = await createReply(postId, comment.id, { content: replyContent });
    onReplyCreated(comment.id, res.data);
    setReplyContent("");
    setReplyOpen(false);
  };

  return (
    <div className={depth > 0 ? "ml-10 border-l border-base-300 pl-6" : ""}>
      <div className="border-b border-base-300 py-5">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${comment.authorId}`} className="shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-full">
              <AvatarFallback label={comment.authorName} className="text-base" />
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <Link to={`/profile/${comment.authorId}`} className="text-[15px] font-bold tracking-tight transition-colors hover:text-primary">
                    {comment.authorName.charAt(0).toUpperCase() + comment.authorName.slice(1)}
                  </Link>
                  <span className="text-[15px] text-base-content/46">@{comment.authorName}</span>
                  <span className="text-[15px] text-base-content/34">{timeAgo(comment.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className="text-[1.03rem] leading-[1.6] tracking-[-0.01em]">{renderContent(comment.content, comment.mentionedUsers)}</div>
            {user && (
              <div className="mt-3 flex items-center gap-5 text-base-content/42">
                <button type="button" className="transition-colors hover:text-error" aria-label="Like comment">
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="transition-colors hover:text-primary"
                  onClick={() => setReplyOpen((open) => !open)}
                  aria-label="Reply to comment"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                {(String(comment.authorId) === user.id || user.role === "Admin") && (
                  <button
                    type="button"
                    className="text-[13px] font-medium transition-colors hover:text-error"
                    onClick={() => onConfirmDelete(comment.id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            )}

            {replyOpen && (
              <form onSubmit={handleReply} className="mt-4 flex gap-2">
                <input
                  type="text"
                  className="input input-bordered input-sm h-10 flex-1 rounded-2xl bg-base-200"
                  placeholder={`Reply to @${comment.authorName}`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm rounded-2xl border-none" disabled={!replyContent.trim()}>
                  <Send className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {comment.replies?.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              user={user}
              depth={depth + 1}
              onReplyCreated={onReplyCreated}
              onConfirmDelete={onConfirmDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<"post" | number | null>(null);

  const postId = Number(id);

  useEffect(() => {
    if (!postId) return;
    getPostById(postId).then((res) => setPost(res.data));
    getCommentsByPost(postId).then((res) => setComments(res.data));
  }, [postId]);

  const handleLike = async () => {
    if (!user || !post) return;
    const res = await toggleLike(post.id);
    setPost({ ...post, hasLiked: res.data.liked, likeCount: res.data.count });
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const res = await createComment(postId, { content: newComment });
    setComments([...comments, res.data]);
    setNewComment("");
  };

  const addReplyToTree = (items: Comment[], parentId: number, reply: Comment): Comment[] =>
    items.map((item) => {
      if (item.id === parentId) {
        return { ...item, replies: [...(item.replies || []), reply] };
      }
      return { ...item, replies: addReplyToTree(item.replies || [], parentId, reply) };
    });

  const removeCommentFromTree = (items: Comment[], commentId: number): Comment[] =>
    items
      .filter((item) => item.id !== commentId)
      .map((item) => ({ ...item, replies: removeCommentFromTree(item.replies || [], commentId) }));

  const handleReplyCreated = (parentId: number, reply: Comment) => {
    setComments((prev) => addReplyToTree(prev, parentId, reply));
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment(postId, commentId);
    setComments((prev) => removeCommentFromTree(prev, commentId));
    setConfirmDelete(null);
  };

  const handleDeletePost = async () => {
    if (!post) return;
    await deletePost(post.id);
    setConfirmDelete(null);
    navigate("/");
  };

  if (!post) {
    return (
      <div className="animate-pulse">
        <div className="border-b border-base-300 px-4 py-4">
          <div className="mb-3 h-7 w-28 rounded bg-base-300" />
          <div className="h-3 w-24 rounded bg-base-300" />
        </div>
        <div className="border-b border-base-300 px-4 py-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-base-300" />
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-base-300" />
              <div className="h-3 w-20 rounded bg-base-300" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full rounded bg-base-300" />
            <div className="h-5 w-2/3 rounded bg-base-300" />
          </div>
        </div>
      </div>
    );
  }

  const isAuthorOrAdmin = user && (String(post.authorId) === user.id || user.role === "Admin");

  return (
    <div className="animate-fade-in">
      <div className="border-b border-base-300 px-6 pb-4 pt-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-base-content/60 transition-colors hover:text-base-content">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-[1.5rem] font-bold tracking-tight">Thread</h1>
        </div>
      </div>

      <div className="border-b border-base-300 px-6 py-6">
        <div className="flex items-start gap-4">
          <Link to={`/profile/${post.authorId}`} className="shrink-0">
            <div className="h-12 w-12 overflow-hidden rounded-full">
              <div className="h-full w-full rounded-full">
                {post.authorProfileImageUrl ? (
                  <img src={post.authorProfileImageUrl} alt={post.authorName} className="h-full w-full object-cover" />
                ) : (
                  <AvatarFallback label={post.authorName} className="text-base" />
                )}
              </div>
            </div>
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <Link to={`/profile/${post.authorId}`} className="text-[15px] font-bold tracking-tight transition-colors hover:text-primary">
                  {post.authorName.charAt(0).toUpperCase() + post.authorName.slice(1)}
                </Link>
                <p className="text-[15px] text-base-content/50">@{post.authorName}</p>
              </div>
              {(isAuthorOrAdmin || user) && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs btn-circle text-base-content/30 transition-colors hover:text-base-content/65"
                  onClick={() => isAuthorOrAdmin && setConfirmDelete("post")}
                  disabled={!isAuthorOrAdmin}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="mt-4 whitespace-pre-wrap text-[1.1rem] leading-[1.55] tracking-[-0.01em]">
              {renderContent(post.content, post.mentionedUsers)}
            </div>
            <p className="mt-6 text-[14px] text-base-content/38">
              {new Date(post.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {new Date(post.createdAt).toLocaleDateString()}
            </p>

            {post.imageUrl && (
              isVideoUrl(post.imageUrl) ? (
                <video src={post.imageUrl} className="mt-4 max-h-96 w-full rounded-[14px]" controls />
              ) : (
                <img src={post.imageUrl} alt="" className="mt-4 max-h-96 w-full rounded-[14px] object-contain" />
              )
            )}

            <div className="mt-6 border-y border-base-300 py-4 text-[15px]">
              <span className="font-bold text-base-content">{post.likeCount}</span> <span className="text-base-content/50">Likes</span>
              <span className="ml-6 font-bold text-base-content">{post.repostCount}</span> <span className="text-base-content/50">Re-yaps</span>
              <span className="ml-6 font-bold text-base-content">{comments.length}</span> <span className="text-base-content/50">Replies</span>
            </div>
            <div className="flex items-center py-4 text-base-content/45">
              <button className="transition-colors hover:text-error" onClick={handleLike} disabled={!user}>
                <Heart className="h-5 w-5" fill={post.hasLiked ? "currentColor" : "none"} />
              </button>
              <button className="ml-7 transition-colors hover:text-base-content/80">
                <Repeat2 className="h-5 w-5" />
              </button>
              <button className="ml-7 transition-colors hover:text-primary">
                <Bookmark className="h-5 w-5" />
              </button>
              <button className="ml-auto transition-colors hover:text-primary">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {user && (
        <div className="border-b border-base-300 px-6 py-5">
          <form onSubmit={handleComment} className="rounded-[18px] border border-base-300 bg-base-200/40 px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
                <AvatarFallback label={user.email} className="text-base" />
              </div>
              <div className="flex-1">
                <textarea
                  className="min-h-[48px] w-full resize-none bg-transparent text-[1.02rem] leading-relaxed outline-none placeholder:text-base-content/36"
                  placeholder="Write a reply..."
                  rows={1}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    className={`btn h-11 min-h-0 rounded-[14px] border-none px-6 text-base font-bold shadow-none ${newComment.trim() ? "btn-primary" : "bg-base-300 text-base-content/40"}`}
                    disabled={!newComment.trim()}
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="px-6 pb-1 pt-5 text-xs font-bold uppercase tracking-[0.22em] text-base-content/36">
        {comments.length} Replies
      </div>

      {comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-base-content/40">No comments yet. Be the first to reply!</p>
      ) : (
        <div>
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              user={user}
              onReplyCreated={handleReplyCreated}
              onConfirmDelete={(commentId) => setConfirmDelete(commentId)}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        open={confirmDelete === "post"}
        title="Delete this yap?"
        description="This action cannot be undone."
        onConfirm={handleDeletePost}
        onCancel={() => setConfirmDelete(null)}
      />
      <ConfirmModal
        open={typeof confirmDelete === "number"}
        title="Delete this comment?"
        description="This action cannot be undone."
        onConfirm={() => typeof confirmDelete === "number" && handleDeleteComment(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
