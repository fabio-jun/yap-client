import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllPosts, getFeed } from "../api/postApi";
import { useAuth } from "../hooks/useAuth";
import YapCard from "../components/YapCard";
import CreateYap from "../components/CreateYap";
import YapSkeleton from "../components/YapSkeleton";
import EmptyState from "../components/EmptyState";
import { Footer2 } from "../components/ui/Footer2";
import { MessageCircle, Users, ArrowUp, Mail, Repeat2 } from "lucide-react";
import type { Post, PagedResponse } from "../types";

const PAGE_SIZE = 10;

const LANDING_FEATURES = [
  {
    icon: MessageCircle,
    title: "Yap away",
    description: "Post up to 280 characters, short enough to say something real.",
  },
  {
    icon: Users,
    title: "Follow people",
    description: "Build a feed that reflects your personality.",
  },
  {
    icon: Mail,
    title: "Direct messages",
    description: "Private conversations, without limits.",
  },
  {
    icon: Repeat2,
    title: "Re-yap & quote",
    description: "React with your own takes.",
  },
];

function LandingPage() {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] animate-fade-in-up items-center justify-center">
      <div className="flex flex-col justify-center flex-1 px-8 md:px-14 lg:px-20 py-16">
        <div className="mb-8">
          <span className="block text-7xl sm:text-8xl lg:text-9xl font-extrabold text-base-content tracking-tighter leading-none select-none">
            Yap<span className="text-primary">.</span>
          </span>
        </div>

        <p className="text-xl md:text-2xl text-base-content/55 font-medium leading-relaxed max-w-[22ch] mb-10">
          Say things.
          <br />
          Find people.
          <br />
        </p>

        <div className="flex flex-col sm:flex-row gap-3 max-w-[20rem]">
          <Link
            to="/register"
            className="btn btn-primary btn-lg flex-1 font-semibold tracking-tight"
          >
            Get started
          </Link>
          <Link
            to="/login"
            className="btn btn-ghost btn-lg flex-1 border border-base-300 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>

      <div className="hidden md:flex flex-col justify-center w-72 lg:w-[22rem] shrink-0 border-l border-base-300/40 px-8 py-16 animate-stagger">
        {LANDING_FEATURES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex gap-4 py-5 border-b border-base-200 last:border-b-0"
          >
            <Icon className="w-4 h-4 shrink-0 mt-1 text-primary" />
            <div>
              <div className="font-semibold text-sm text-base-content leading-tight">
                {title}
              </div>
              <div className="text-xs text-base-content/50 mt-1 leading-relaxed">
                {description}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-10">
        <Footer2 />
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

  const handleRepostToggle = (postId: number, reposted: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasReposted: reposted, repostCount: count } : p
      )
    );
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
            <YapCard
              key={post.isRepost ? `repost-${post.repostId}` : `post-${post.id}`}
              post={post}
              onLikeToggle={handleLikeToggle}
              onBookmarkToggle={handleBookmarkToggle}
              onDelete={handleDelete}
              onRepostToggle={handleRepostToggle}
            />
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
