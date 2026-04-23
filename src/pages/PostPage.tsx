import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById, deletePost } from "../api/postApi";
import { toggleLike } from "../api/likeApi";
import { getCommentsByPost, createComment, createReply, deleteComment } from "../api/commentApi";
import { useAuth } from "../hooks/useAuth";
import { Heart, Trash2, Send, Reply } from "lucide-react";
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
    <div className={depth > 0 ? "ml-4 pl-3 border-l border-base-300" : ""}>
      <div className="bg-base-300/50 rounded-xl p-3 transition-colors hover:bg-base-300">
        <div className="flex justify-between items-center mb-1.5">
          <Link to={`/profile/${comment.authorId}`} className="font-semibold text-sm hover:text-primary transition-colors">
            @{comment.authorName}
          </Link>
          <span className="text-xs text-base-content/40">
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
        </div>
        <p className="text-sm leading-relaxed">{renderContent(comment.content, comment.mentionedUsers)}</p>
        {user && (
          <div className="flex gap-1 mt-1.5">
            <button
              type="button"
              className="btn btn-ghost btn-xs text-base-content/40 hover:text-primary gap-1 transition-colors"
              onClick={() => setReplyOpen((open) => !open)}
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
            {(String(comment.authorId) === user.id || user.role === "Admin") && (
              <button
                type="button"
                className="btn btn-ghost btn-xs text-base-content/30 hover:text-error gap-1 transition-colors"
                onClick={() => onConfirmDelete(comment.id)}
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            )}
          </div>
        )}

        {replyOpen && (
          <form onSubmit={handleReply} className="flex gap-2 mt-2">
            <input
              type="text"
              className="input input-bordered input-sm flex-1 bg-base-100/50"
              placeholder={`Reply to @${comment.authorName}`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!replyContent.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

      {comment.replies?.length > 0 && (
        <div className="mt-2 space-y-2">
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
      <div className="space-y-4 animate-pulse">
        <div className="card bg-base-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-base-300" />
            <div className="space-y-2">
              <div className="h-4 w-28 bg-base-300 rounded" />
              <div className="h-3 w-20 bg-base-300 rounded" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-5 w-full bg-base-300 rounded" />
            <div className="h-5 w-2/3 bg-base-300 rounded" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-8 w-16 bg-base-300 rounded" />
          </div>
        </div>
        <div className="card bg-base-200 p-6">
          <div className="h-5 w-24 bg-base-300 rounded mb-4" />
          <div className="h-10 w-full bg-base-300 rounded" />
        </div>
      </div>
    );
  }

  const isAuthorOrAdmin = user && (String(post.authorId) === user.id || user.role === "Admin");

  return (
    <div className="animate-fade-in">
      <div className="card bg-base-200 mb-4">
        <div className="card-body">
          {/* Author header with avatar */}
          <div className="flex items-center gap-3">
            <Link to={`/profile/${post.authorId}`} className="shrink-0">
              <div className="avatar">
                <div className="w-12 h-12 rounded-full ring-2 ring-base-300 hover:ring-primary transition-all">
                  {post.authorProfileImageUrl ? (
                    <img src={post.authorProfileImageUrl} alt={post.authorName} />
                  ) : (
                    <div className="bg-primary text-primary-content flex items-center justify-center text-lg font-bold w-full h-full">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
            </Link>
            <div className="flex-1">
              <Link to={`/profile/${post.authorId}`} className="font-bold hover:text-primary transition-colors">
                {post.authorName.charAt(0).toUpperCase() + post.authorName.slice(1)}
              </Link>
              <p className="text-sm text-base-content/50">@{post.authorName}</p>
            </div>
            <span className="text-sm text-base-content/50 tooltip tooltip-bottom cursor-default" data-tip={new Date(post.createdAt).toLocaleString()}>
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-lg mt-3 whitespace-pre-wrap leading-relaxed">{renderContent(post.content, post.mentionedUsers)}</p>

          {post.imageUrl && (
            isVideoUrl(post.imageUrl) ? (
              <video src={post.imageUrl} className="rounded-xl mt-3 max-h-96 w-full" controls />
            ) : (
              <img src={post.imageUrl} alt="" className="rounded-xl mt-3 max-h-96 w-full object-contain" />
            )
          )}

          <div className="flex gap-3 mt-3 pt-3 border-t border-base-300">
            <button
              className={`btn btn-ghost btn-sm gap-1.5 transition-all duration-200 ${post.hasLiked ? "text-error" : "hover:text-error/70"}`}
              onClick={handleLike}
              disabled={!user}
            >
              <Heart className="w-4 h-4" fill={post.hasLiked ? "currentColor" : "none"} /> {post.likeCount}
            </button>
            {isAuthorOrAdmin && (
              <button
                className="btn btn-ghost btn-sm gap-1.5 text-base-content/40 hover:text-error transition-colors ml-auto"
                onClick={() => setConfirmDelete("post")}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="font-bold text-lg mb-3">
            Comments {comments.length > 0 && <span className="text-base-content/40 font-normal text-sm">({comments.length})</span>}
          </h3>

          {user && (
            <form onSubmit={handleComment} className="flex gap-2 mb-4">
              <input
                type="text"
                className="input input-bordered flex-1 bg-base-100/50"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!newComment.trim()}
                aria-label="Send comment"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-base-content/40 py-6 text-sm">No comments yet. Be the first to reply!</p>
          ) : (
            <div className="space-y-3">
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
        </div>
      </div>

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
