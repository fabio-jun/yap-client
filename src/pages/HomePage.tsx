import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllPosts, getFeed } from "../api/postApi";
import { useAuth } from "../contexts/AuthContext";
import YapCard from "../components/YapCard";
import CreateYap from "../components/CreateYap";
import YapSkeleton from "../components/YapSkeleton";
import EmptyState from "../components/EmptyState";
import { MessageCircle, Users, ArrowUp, Mail, Zap } from "lucide-react";
import type { Post, PagedResponse } from "../types";

const PAGE_SIZE = 10;

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 animate-fade-in-up">
      {/* Hero */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          Join the conversation
        </div>
        <h1 className="text-7xl font-extrabold text-primary mb-3 tracking-tighter leading-none">
          Yap
        </h1>
        <p className="text-xl text-base-content/60 max-w-sm leading-relaxed">
          Share your thoughts. Connect with people. Keep it short.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <Link to="/register" className="btn btn-primary btn-lg flex-1 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
          Get started
        </Link>
        <Link to="/login" className="btn btn-ghost btn-lg flex-1 border border-base-300">
          Sign in
        </Link>
      </div>

      {/* Features */}
      <div className="grid grid-cols-3 gap-8 mt-20 animate-stagger">
        <div className="flex flex-col items-center gap-3 group">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-content transition-colors duration-300">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-base-content/60">Yap away</span>
        </div>
        <div className="flex flex-col items-center gap-3 group">
          <div className="p-3 rounded-2xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-secondary-content transition-colors duration-300">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-base-content/60">Follow people</span>
        </div>
        <div className="flex flex-col items-center gap-3 group">
          <div className="p-3 rounded-2xl bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-content transition-colors duration-300">
            <Mail className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium text-base-content/60">Direct messages</span>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="flex-1 py-3 text-center font-semibold relative hover:bg-base-200/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <span className={`transition-colors duration-200 ${active ? "text-base-content" : "text-base-content/50"}`}>
        {children}
      </span>
      {active && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary animate-scale-in" />
      )}
    </button>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"all" | "feed">("feed");
  const pageRef = useRef(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
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

  useEffect(() => {
    if (!user) return;
    pageRef.current = 1;
    setHasMore(true);
    setPosts([]);
    setLoading(true);
    loadPosts(1, true, tab);
  }, [tab, user, loadPosts]);

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

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>Feed</TabButton>
        <TabButton active={tab === "all"} onClick={() => setTab("all")}>All Yaps</TabButton>
      </div>

      <CreateYap onCreated={handleCreated} />

      {loading && posts.length === 0 ? (
        <YapSkeleton count={4} />
      ) : posts.length === 0 ? (
        <EmptyState
          icon={tab === "feed" ? <Users className="w-12 h-12" /> : <MessageCircle className="w-12 h-12" />}
          title={tab === "feed" ? "Your feed is empty" : "No yaps yet"}
          description={tab === "feed" ? "Follow some users to see their yaps here!" : "Be the first to yap!"}
        />
      ) : (
        <div className="animate-fade-in">
          {posts.map((post) => (
            <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onBookmarkToggle={handleBookmarkToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {loading && posts.length > 0 && (
        <div className="flex justify-center py-4">
          <span className="loading loading-spinner loading-md text-primary"></span>
        </div>
      )}

      {hasMore && !loading && <div ref={observerRef} className="h-10" />}

      {showScrollTop && (
        <button
          className="fixed bottom-6 right-6 btn btn-circle btn-primary shadow-lg shadow-primary/25 z-50 animate-fade-in"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
