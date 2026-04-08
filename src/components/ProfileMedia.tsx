import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPostsByUser } from "../api/postApi";
import { Image } from "lucide-react";
import type { Post } from "../types";

export default function ProfileMedia() {
  const { id } = useParams();
  const [mediaPosts, setMediaPosts] = useState<Post[]>([]);

  useEffect(() => {
    const userId = Number(id);
    if (!userId) return;
    getPostsByUser(userId).then((res) => {
      setMediaPosts((res.data as Post[]).filter((p) => p.imageUrl));
    });
  }, [id]);

  if (mediaPosts.length === 0) return null;

  return (
    <div className="card bg-base-200 p-4 mt-4">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <Image className="w-4 h-4" /> Media
      </h3>
      <div className="grid grid-cols-3 gap-1">
        {mediaPosts.slice(0, 9).map((post) => (
          <Link key={post.id} to={`/post/${post.id}`} className="aspect-square overflow-hidden rounded-lg">
            {post.imageUrl!.includes("/video/upload/") ? (
              <video src={post.imageUrl} className="w-full h-full object-cover" muted />
            ) : (
              <img src={post.imageUrl} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
