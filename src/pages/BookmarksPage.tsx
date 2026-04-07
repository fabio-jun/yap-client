import { useEffect, useState } from "react";
import { getBookmarks } from "../api/bookmarkApi";
import YapCard from "../components/YapCard";
import type { Post } from "../types";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarks()
      .then((res) => setPosts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p
      )
    );
  };

  const handleBookmarkToggle = (postId: number, bookmarked: boolean) => {
    if (!bookmarked) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  };

  const handleDelete = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  return (
    <div>
      <h1 className="text-xl font-bold p-4 border-b border-base-300">Bookmarks</h1>
      {loading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}
      {!loading && posts.length === 0 && (
        <p className="text-center text-base-content/50 py-8">No bookmarks yet.</p>
      )}
      {posts.map((post) => (
        <YapCard
          key={post.id}
          post={post}
          onLikeToggle={handleLikeToggle}
          onBookmarkToggle={handleBookmarkToggle}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
