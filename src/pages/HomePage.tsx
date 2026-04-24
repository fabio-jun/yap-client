import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllPosts, getFeed } from "../api/postApi";
import { useAuth } from "../hooks/useAuth";
import YapCard from "../components/YapCard";
import CreateYap from "../components/CreateYap";
import YapSkeleton from "../components/YapSkeleton";
import EmptyState from "../components/EmptyState";
import { MessageCircle, Users, ArrowUp, Mail, Repeat2 } from "lucide-react";
import type { Post, PagedResponse } from "../types";

const PAGE_SIZE = 10;

const LANDING_FEATURES = [
  {
    icon: MessageCircle,
    title: "Yap away",
    description: "280 characters. Say something real.",
  },
  {
    icon: Users,
    title: "Follow people",
    description: "A feed that reflects who you are.",
  },
  {
    icon: Mail,
    title: "Direct messages",
    description: "Private conversations, no limits.",
  },
  {
    icon: Repeat2,
    title: "Re-yap & quote",
    description: "React with your own take.",
  },
];

function LandingPage() {
  return (
    <div className="flex h-[calc(100vh-68px)] flex-col animate-fade-in overflow-hidden">
      <div className="mx-auto flex flex-1 w-full max-w-[1100px] items-stretch px-8">
        {/* Left column */}
        <div className="flex flex-1 flex-col justify-center pr-16 py-10">
          <h1 className="font-brand mb-2 text-[5.5rem] font-extrabold leading-none tracking-[-3px] text-base-content select-none">
            Yap<span className="text-primary">.</span>
          </h1>
          <p className="mb-10 max-w-[20ch] text-[1.375rem] font-medium leading-[1.4] text-base-content/56">
            Say things. Find people.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/register"
              className="btn btn-primary h-[52px] rounded-[10px] border-none px-8 text-[15px] font-bold shadow-none"
            >
              Get started &mdash; it's free
            </Link>
            <Link
              to="/login"
              className="btn btn-ghost h-[52px] rounded-[10px] border border-base-300 px-7 text-[15px] font-semibold shadow-none"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Right column */}
        <div className="hidden w-[320px] shrink-0 border-l border-base-300 pl-12 py-10 md:flex flex-col justify-center">
          {LANDING_FEATURES.map(({ icon: Icon, title, description }, i) => (
            <div
              key={title}
              className={`flex items-start gap-4 py-5 ${i < LANDING_FEATURES.length - 1 ? "border-b border-base-300" : ""}`}
            >
              <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-primary">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <div>
                <div className="font-brand text-[14px] font-bold text-base-content">{title}</div>
                <div className="mt-0.5 text-[13px] leading-[1.5] text-base-content/50">{description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="shrink-0 border-t border-base-300 py-4">
        <div className="mx-auto flex max-w-[1100px] items-center justify-center gap-6 px-8 text-[13px] text-base-content/40">
          <span>© 2026 Yap. All rights reserved.</span>
          <Link to="/terms" className="hover:text-base-content/70 transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-base-content/70 transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      className="relative flex-1 cursor-pointer py-4 text-center text-[16px] font-semibold transition-colors hover:bg-base-200/30"
      onClick={onClick}
    >
      <span className={`transition-colors duration-200 ${active ? "text-base-content" : "text-base-content/50"}`}>
        {children}
      </span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />}
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
        setPosts((prev) => (reset ? data.items : [...prev, ...data.items]));
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
    return () => {
      if (el) observer.unobserve(el);
    };
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
      <div className="border-b border-base-300">
        <div className="flex">
          <TabButton active={tab === "feed"} onClick={() => setTab("feed")}>Feed</TabButton>
          <TabButton active={tab === "all"} onClick={() => setTab("all")}>All Yaps</TabButton>
        </div>
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
          className="fixed bottom-6 right-6 z-50 btn btn-circle btn-primary shadow-lg shadow-primary/25 animate-fade-in"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
