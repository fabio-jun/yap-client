import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPostById, deletePost } from "../api/postApi";
import { toggleLike } from "../api/likeApi";
import { getCommentsByPost, createComment, deleteComment } from "../api/commentApi";
import { useAuth } from "../contexts/AuthContext";
import { Heart, Trash2 } from "lucide-react";
import type { Post, Comment } from "../types";

export default function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

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

  const handleDeleteComment = async (commentId: number) => {
    await deleteComment(postId, commentId);
    setComments(comments.filter((c) => c.id !== commentId));
  };

  const handleDeletePost = async () => {
    if (!post) return;
    await deletePost(post.id);
    navigate("/");
  };

  if (!post) return <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg"></span></div>;

  const isAuthorOrAdmin = user && (String(post.authorId) === user.id || user.role === "Admin");

  return (
    <div>
      <div className="card bg-base-200 mb-4">
        <div className="card-body">
          <div className="flex justify-between items-center">
            <Link to={`/profile/${post.authorId}`} className="font-bold hover:text-primary">
              @{post.authorName}
            </Link>
            <span className="text-sm text-base-content/50">
              {new Date(post.createdAt).toLocaleDateString()}
            </span>
          </div>

          <p className="text-lg mt-2 whitespace-pre-wrap">{post.content}</p>

          {post.imageUrl && (
            post.imageUrl.includes("/video/upload/") ? (
              <video src={post.imageUrl} className="rounded-xl mt-2 max-h-96 w-full" controls />
            ) : (
              <img src={post.imageUrl} alt="" className="rounded-xl mt-2 max-h-96 w-full object-cover" />
            )
          )}

          <div className="flex gap-3 mt-3">
            <button
              className={`btn btn-ghost btn-sm gap-1 ${post.hasLiked ? "text-error" : ""}`}
              onClick={handleLike}
              disabled={!user}
            >
              <Heart className="w-4 h-4" fill={post.hasLiked ? "currentColor" : "none"} /> {post.likeCount}
            </button>
            {isAuthorOrAdmin && (
              <button className="btn btn-outline btn-error btn-sm gap-1" onClick={handleDeletePost}>
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-200">
        <div className="card-body">
          <h3 className="font-bold text-lg mb-3">Comments</h3>

          {user && (
            <form onSubmit={handleComment} className="flex gap-2 mb-4">
              <input
                type="text"
                className="input input-bordered flex-1"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={!newComment.trim()}>
                Reply
              </button>
            </form>
          )}

          {comments.length === 0 ? (
            <p className="text-center text-base-content/50 py-4">No comments yet.</p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-base-300 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-1">
                    <Link to={`/profile/${comment.authorId}`} className="font-semibold text-sm hover:text-primary">
                      @{comment.authorName}
                    </Link>
                    <span className="text-xs text-base-content/50">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                  {user && (String(comment.authorId) === user.id || user.role === "Admin") && (
                    <button
                      className="btn btn-ghost btn-xs text-error mt-1 gap-1"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
