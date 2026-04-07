import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllPosts, getFeed } from "../api/postApi";
import { useAuth } from "../contexts/AuthContext";
import YapCard from "../components/YapCard";
import CreateYap from "../components/CreateYap";
import type { Post, PagedResponse } from "../types";

const PAGE_SIZE = 10;

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-5xl font-extrabold text-primary mb-4">Yap</h1>
      <p className="text-xl text-base-content/70 mb-8 max-w-md">
        Share your thoughts with the world. Follow people, discover conversations, and join the community.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
        <Link to="/register" className="btn btn-outline btn-lg">Register</Link>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"all" | "feed">("feed");
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadPosts = useCallback(async (pageNum: number, reset: boolean, currentTab: "all" | "feed") => {
    if (!user) return;
    setLoading(true);
    try {
      if (currentTab === "feed") {
        const res = await getFeed();
        setPosts(res.data);
        setHasMore(false);
      } else {
        const res = await getAllPosts({ page: pageNum, pageSize: PAGE_SIZE });
        const data = res.data as PagedResponse<Post>;
        setPosts((prev) => reset ? data.items : [...prev, ...data.items]);
        setHasMore(pageNum < data.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Reset when tab or user changes
  useEffect(() => {
    if (!user) return;
    pageRef.current = 1;
    setHasMore(true);
    setPosts([]);
    loadPosts(1, true, tab);
  }, [tab, user, loadPosts]);

  // Infinite scroll observer
  useEffect(() => {
    if (!user || !hasMore || loading || tab === "feed") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          pageRef.current += 1;
          loadPosts(pageRef.current, false, tab);
        }
      },
      { threshold: 0.5 }
    );

    const el = observerRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, loading, tab, user, loadPosts]);

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p
      )
    );
  };

  const handleBookmarkToggle = (postId: number, bookmarked: boolean) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasBookmarked: bookmarked } : p
      )
    );
  };

  const handleDelete = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  if (!user) return <LandingPage />;

  return (
    <div>
      <div className="flex border-b border-base-300 mb-0">
        <button
          className="flex-1 py-3 text-center font-semibold relative hover:bg-base-200 transition-colors"
          onClick={() => setTab("feed")}
        >
          <span className={tab === "feed" ? "text-base-content" : "text-base-content/50"}>Feed</span>
          {tab === "feed" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />}
        </button>
        <button
          className="flex-1 py-3 text-center font-semibold relative hover:bg-base-200 transition-colors"
          onClick={() => setTab("all")}
        >
          <span className={tab === "all" ? "text-base-content" : "text-base-content/50"}>All Yaps</span>
          {tab === "all" && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary" />}
        </button>
      </div>

      <CreateYap onCreated={handleCreated} />

      {posts.length === 0 && !loading ? (
        <p className="text-center text-base-content/50 py-8">
          {tab === "feed" ? "Follow some users to see their yaps here!" : "No yaps yet."}
        </p>
      ) : (
        posts.map((post) => (
          <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onBookmarkToggle={handleBookmarkToggle} onDelete={handleDelete} />
        ))
      )}

      {loading && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      )}

      {hasMore && !loading && <div ref={observerRef} className="h-10" />}
    </div>
  );
}
