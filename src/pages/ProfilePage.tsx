import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserById, updateProfile } from "../api/userApi";
import { getPostsByUser } from "../api/postApi";
import { toggleFollow, getFollowers, getFollowing } from "../api/followApi";
import { uploadFile } from "../api/uploadApi";
import { useAuth } from "../contexts/AuthContext";
import { X, LogOut, Pencil } from "lucide-react";
import toast from "react-hot-toast";
import YapCard from "../components/YapCard";
import type { Post, User } from "../types";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userId = Number(id);
  const isOwnProfile = authUser && String(userId) === authUser.id;

  useEffect(() => {
    if (!userId) return;
    getUserById(userId).then((res) => setProfile(res.data));
    getPostsByUser(userId).then((res) => setPosts(res.data));
  }, [userId]);

  const openModal = async (type: "followers" | "following") => {
    setModalType(type);
    setModalLoading(true);
    try {
      const res = type === "followers" ? await getFollowers(userId) : await getFollowing(userId);
      setModalUsers(res.data);
    } catch {
      setModalUsers([]);
    } finally {
      setModalLoading(false);
    }
  };

  const handleFollow = async () => {
    const res = await toggleFollow(userId);
    setIsFollowing(res.data.following);
    toast(res.data.following ? "Followed!" : "Unfollowed");
    if (profile) {
      setProfile({
        ...profile,
        followersCount: profile.followersCount + (res.data.following ? 1 : -1),
      });
    }
  };

  const handleSaveBio = async () => {
    if (!profile) return;
    try {
      const res = await updateProfile({
        userName: profile.userName,
        email: profile.email,
        profileImageUrl: profile.profileImageUrl,
        bio: bioText,
      });
      setProfile(res.data);
      setEditingBio(false);
      toast.success("Bio updated!");
    } catch {
      toast.error("Failed to update bio.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const uploadRes = await uploadFile(file);
      const res = await updateProfile({
        userName: profile.userName,
        email: profile.email,
        profileImageUrl: uploadRes.data.url,
      });
      setProfile(res.data);
    } catch {
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p
      )
    );
  };

  const handleDelete = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  if (!profile) return <div className="flex justify-center py-8"><span className="loading loading-spinner loading-lg"></span></div>;

  return (
    <div>
      <div className="card bg-base-200 mb-4">
        <div className="card-body items-center text-center">
          <div
            className="relative group cursor-pointer"
            onClick={() => isOwnProfile && fileInputRef.current?.click()}
          >
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                {profile.profileImageUrl ? (
                  <img src={profile.profileImageUrl} alt={profile.userName} />
                ) : (
                  <div className="bg-primary text-primary-content flex items-center justify-center text-3xl font-bold w-full h-full">
                    {profile.userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            {isOwnProfile && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? "..." : "Change"}
              </div>
            )}
          </div>

          {isOwnProfile && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          )}

          <h2 className="text-2xl font-bold mt-2">@{profile.userName}</h2>

          {editingBio ? (
            <div className="mt-2 w-full max-w-xs">
              <textarea
                className="textarea textarea-bordered w-full text-sm"
                maxLength={160}
                rows={2}
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                placeholder="Write something about yourself..."
              />
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-base-content/50">{bioText.length}/160</span>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-xs" onClick={() => setEditingBio(false)}>Cancel</button>
                  <button className="btn btn-primary btn-xs" onClick={handleSaveBio}>Save</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1">
              {profile.bio ? (
                <p className="text-base-content/70 text-sm">{profile.bio}</p>
              ) : isOwnProfile ? (
                <p className="text-base-content/40 text-sm italic">Add a bio...</p>
              ) : null}
              {isOwnProfile && (
                <button
                  className="btn btn-ghost btn-xs btn-circle"
                  onClick={() => { setBioText(profile.bio || ""); setEditingBio(true); }}
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          <div className="stats stats-horizontal bg-base-300 mt-3">
            <button className="stat place-items-center py-2 px-4 cursor-pointer hover:bg-base-100 transition-colors" onClick={() => openModal("followers")}>
              <div className="stat-value text-lg">{profile.followersCount}</div>
              <div className="stat-desc">Followers</div>
            </button>
            <button className="stat place-items-center py-2 px-4 cursor-pointer hover:bg-base-100 transition-colors" onClick={() => openModal("following")}>
              <div className="stat-value text-lg">{profile.followingCount}</div>
              <div className="stat-desc">Following</div>
            </button>
            <div className="stat place-items-center py-2 px-4">
              <div className="stat-value text-lg">{posts.length}</div>
              <div className="stat-desc">Yaps</div>
            </div>
          </div>

          {authUser && !isOwnProfile && (
            <button
              className={`btn mt-3 ${isFollowing ? "btn-outline btn-error" : "btn-primary"}`}
              onClick={handleFollow}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          {isOwnProfile && (
            <button
              className="btn btn-outline btn-error btn-sm mt-3 gap-1"
              onClick={() => { logout(); navigate("/"); }}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-base-content/50 py-8">No yaps yet.</p>
      ) : (
        posts.map((post) => (
          <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onDelete={handleDelete} />
        ))
      )}

      {modalType && (
        <dialog className="modal modal-open" onClick={() => setModalType(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">
                {modalType === "followers" ? "Followers" : "Following"}
              </h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setModalType(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md"></span>
              </div>
            ) : modalUsers.length === 0 ? (
              <p className="text-center text-base-content/50 py-8">
                {modalType === "followers" ? "No followers yet." : "Not following anyone."}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {modalUsers.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 transition-colors"
                    onClick={() => setModalType(null)}
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full">
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} alt={u.userName} />
                        ) : (
                          <div className="bg-primary text-primary-content flex items-center justify-center text-sm font-bold w-full h-full">
                            {u.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="font-semibold">@{u.userName}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
}
