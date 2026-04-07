import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getAllPosts } from "../api/postApi";
import { searchUsers } from "../api/userApi";
import YapCard from "../components/YapCard";
import type { Post, User } from "../types";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tab, setTab] = useState<"yaps" | "users">("yaps");

  useEffect(() => {
    if (tag) {
      getAllPosts({ tag }).then((res) => setPosts(res.data));
      setUsers([]);
    } else if (query) {
      getAllPosts({ search: query }).then((res) => setPosts(res.data));
      searchUsers(query).then((res) => setUsers(res.data)).catch(() => setUsers([]));
    }
  }, [query, tag]);

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p
      )
    );
  };

  const title = tag ? `#${tag}` : `Search: "${query}"`;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      {!tag && (
        <div role="tablist" className="tabs tabs-bordered mb-4">
          <button
            role="tab"
            className={`tab ${tab === "yaps" ? "tab-active" : ""}`}
            onClick={() => setTab("yaps")}
          >
            Yaps
          </button>
          <button
            role="tab"
            className={`tab ${tab === "users" ? "tab-active" : ""}`}
            onClick={() => setTab("users")}
          >
            Users
          </button>
        </div>
      )}

      {(tag || tab === "yaps") && (
        <>
          {posts.length === 0 ? (
            <p className="text-center text-base-content/50 py-8">No yaps found.</p>
          ) : (
            posts.map((post) => (
              <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} />
            ))
          )}
        </>
      )}

      {!tag && tab === "users" && (
        <>
          {users.length === 0 ? (
            <p className="text-center text-base-content/50 py-8">No users found.</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <Link
                  key={u.id}
                  to={`/profile/${u.id}`}
                  className="card bg-base-200 hover:bg-base-300 transition-colors"
                >
                  <div className="card-body p-4 flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar placeholder">
                        <div className="bg-primary text-primary-content rounded-full w-10">
                          <span>{u.userName.charAt(0).toUpperCase()}</span>
                        </div>
                      </div>
                      <span className="font-bold">@{u.userName}</span>
                    </div>
                    <span className="text-sm text-base-content/50">
                      {u.followersCount} followers
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
