import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPostsByUser } from "../api/postApi";
import { Image } from "lucide-react";
import type { Post } from "../types";
import { isVideoUrl } from "../utils/isVideoUrl";

export default function ProfileMedia({ userId }: { userId: number }) {
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!userId) return;
    getPostsByUser(userId).then((res) => {
      setMediaPosts((res.data as Post[]).filter((p) => p.imageUrl));
    });
  }, [userId]);

  if (mediaPosts.length === 0) return null;

  return (
    <div className="card bg-base-200 p-4 mt-4 animate-fade-in">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <Image className="w-4 h-4 text-primary" /> Media
      </h3>
      <div className="grid grid-cols-3 gap-1.5">
        {mediaPosts.slice(0, 9).map((post) => (
          <Link key={post.id} to={`/post/${post.id}`} className="aspect-square overflow-hidden rounded-lg cursor-pointer group">
            {isVideoUrl(post.imageUrl) ? (
              <video src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" muted />
            ) : (
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
