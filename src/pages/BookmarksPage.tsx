import { useEffect, useState } from "react";
import { getBookmarks } from "../api/bookmarkApi";
import YapCard from "../components/YapCard";
import YapSkeleton from "../components/YapSkeleton";
import EmptyState from "../components/EmptyState";
import { Bookmark } from "lucide-react";
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
    <div className="animate-fade-in">
      <div className="border-b border-base-300 px-4 pb-4 pt-3">
        <h1 className="text-[1.5rem] font-bold tracking-tight">Bookmarks</h1>
        {!loading && posts.length > 0 && (
          <div className="mt-3 text-[15px] text-base-content/50">
            {posts.length} saved yap{posts.length === 1 ? "" : "s"}
          </div>
        )}
      </div>
      {loading ? (
        <YapSkeleton count={3} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-12 h-12" />}
          title="No bookmarks yet"
          description="Save yaps to read them later."
        />
      ) : (
        <div>
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
      )}
    </div>
  );
}
