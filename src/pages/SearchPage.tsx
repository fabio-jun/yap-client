import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAllPosts } from "../api/postApi";
import { searchUsers } from "../api/userApi";
import YapCard from "../components/YapCard";
import YapSkeleton from "../components/YapSkeleton";
import EmptyState from "../components/EmptyState";
import { Search, Hash } from "lucide-react";
import type { Post, User } from "../types";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"yaps" | "users">("yaps");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    if (tag) {
      getAllPosts({ tag }).then((res) => { setPosts(res.data); setLoading(false); });
      setUsers([]);
    } else if (query) {
      Promise.all([
        getAllPosts({ search: query }).then((res) => setPosts(res.data)),
        searchUsers(query).then((res) => setUsers(res.data)).catch(() => setUsers([])),
      ]).finally(() => setLoading(false));
    }
  }, [query, tag]);

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p
      )
    );
  };

  const title = tag ? (
    <span className="flex items-center gap-2">
      <Hash className="w-6 h-6 text-primary" />
      {tag}
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <Search className="w-5 h-5 text-base-content/40" />
      "{query}"
    </span>
  );

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {!tag && (
        <div className="flex border-b border-base-300 mb-4">
          <button
            className="flex-1 py-3 text-center font-semibold relative hover:bg-base-200/50 transition-colors cursor-pointer"
            onClick={() => setTab("yaps")}
          >
            <span className={`transition-colors duration-200 ${tab === "yaps" ? "text-base-content" : "text-base-content/50"}`}>
              Yaps
            </span>
            {tab === "yaps" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary animate-scale-in" />
            )}
          </button>
          <button
            className="flex-1 py-3 text-center font-semibold relative hover:bg-base-200/50 transition-colors cursor-pointer"
            onClick={() => setTab("users")}
          >
            <span className={`transition-colors duration-200 ${tab === "users" ? "text-base-content" : "text-base-content/50"}`}>
              Users
            </span>
            {tab === "users" && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-1 rounded-full bg-primary animate-scale-in" />
            )}
          </button>
        </div>
      )}

      {loading ? (
        <YapSkeleton count={3} />
      ) : (tag || tab === "yaps") ? (
        posts.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No yaps found"
            description={tag ? `No yaps with #${tag}` : `No results for "${query}"`}
          />
        ) : (
          posts.map((post) => (
            <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
          ))
        )
      ) : (
        users.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title="No users found"
            description={`No users matching "${query}"`}
          />
        ) : (
          <div className="space-y-2 animate-stagger">
            {users.map((u) => (
              <Link
                key={u.id}
                to={`/profile/${u.id}`}
                className="card bg-base-200 hover:bg-base-300/50 transition-colors duration-200 cursor-pointer"
              >
                <div className="card-body p-4 flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-10 rounded-full ring-2 ring-base-300">
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} alt={u.userName} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                            {u.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="font-bold block">
                        {u.displayName || u.userName.charAt(0).toUpperCase() + u.userName.slice(1)}
                      </span>
                      <span className="text-sm text-base-content/50">@{u.userName}</span>
                    </div>
                  </div>
                  <span className="text-sm text-base-content/50">
                    {u.followersCount} followers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}
