import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getUserById, updateProfile } from "../api/userApi";
import { getPostsByUser } from "../api/postApi";
import { toggleFollow, getFollowers, getFollowing } from "../api/followApi";
import { uploadFile } from "../api/uploadApi";
import { useAuth } from "../contexts/AuthContext";
import { X, LogOut, Mail, Camera } from "lucide-react";
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
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const userId = Number(id);
  const isOwnProfile = authUser && String(userId) === authUser.id;

  useEffect(() => {
    if (!userId) return;
    getUserById(userId).then((res) => setProfile(res.data));
    getPostsByUser(userId).then((res) => setPosts(res.data));
  }, [userId]);

  const openEditModal = () => {
    if (!profile) return;
    setEditName(profile.displayName || "");
    setEditBio(profile.bio || "");
    setEditImageUrl(profile.profileImageUrl || "");
    setEditOpen(true);
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditUploading(true);
    try {
      const uploadRes = await uploadFile(file);
      setEditImageUrl(uploadRes.data.url);
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setEditUploading(false);
    }
  };

  const handleEditSave = async () => {
    if (!profile) return;
    setEditSaving(true);
    try {
      const res = await updateProfile({
        userName: profile.userName,
        email: profile.email,
        displayName: editName || undefined,
        bio: editBio || undefined,
        profileImageUrl: editImageUrl || undefined,
      });
      setProfile(res.data);
      setEditOpen(false);
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setEditSaving(false);
    }
  };

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

  if (!profile) return (
    <div className="animate-pulse">
      <div className="card bg-base-200 mb-4 overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="card-body items-center text-center -mt-12">
          <div className="w-24 h-24 rounded-full bg-base-300 ring-4 ring-base-200" />
          <div className="h-6 w-32 bg-base-300 rounded mt-2" />
          <div className="h-4 w-48 bg-base-300 rounded" />
          <div className="flex gap-6 mt-2">
            <div className="h-10 w-20 bg-base-300 rounded" />
            <div className="h-10 w-20 bg-base-300 rounded" />
            <div className="h-10 w-20 bg-base-300 rounded" />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card bg-base-200 p-4">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-base-300" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-base-300 rounded" />
                <div className="h-4 w-full bg-base-300 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="card bg-base-200 mb-4 overflow-hidden">
        {/* Gradient banner */}
        <div className="h-28 bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/10" />

        <div className="card-body items-center text-center -mt-14">
          <div className="avatar">
            <div className="w-24 rounded-full ring-4 ring-base-200 shadow-lg">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.userName} />
              ) : (
                <div className="bg-primary text-primary-content flex items-center justify-center text-3xl font-bold w-full h-full">
                  {profile.userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold mt-2">
            {profile.displayName || profile.userName.charAt(0).toUpperCase() + profile.userName.slice(1)}
          </h2>
          <p className="text-base-content/50 text-sm">@{profile.userName}</p>

          {profile.bio && (
            <p className="text-base-content/70 text-sm mt-1 max-w-sm leading-relaxed">{profile.bio}</p>
          )}

          <div className="flex gap-6 mt-3">
            <button
              className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
              onClick={() => openModal("followers")}
            >
              <span className="text-lg font-bold">{profile.followersCount}</span>
              <span className="text-xs text-base-content/50">Followers</span>
            </button>
            <button
              className="flex flex-col items-center cursor-pointer hover:text-primary transition-colors"
              onClick={() => openModal("following")}
            >
              <span className="text-lg font-bold">{profile.followingCount}</span>
              <span className="text-xs text-base-content/50">Following</span>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold">{posts.length}</span>
              <span className="text-xs text-base-content/50">Yaps</span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="flex gap-2 mt-3">
              <button className="btn btn-outline btn-sm hover:btn-primary transition-all" onClick={openEditModal}>
                Edit profile
              </button>
              <button
                className="btn btn-ghost btn-sm text-base-content/50 hover:text-error gap-1 transition-colors"
                onClick={() => { logout(); navigate("/"); }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}

          {authUser && !isOwnProfile && (
            <div className="flex gap-2 mt-3">
              <button
                className={`btn btn-sm ${isFollowing ? "btn-outline" : "btn-primary shadow-lg shadow-primary/20"}`}
                onClick={handleFollow}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <Link to={`/messages/${userId}`} className="btn btn-ghost btn-sm gap-1">
                <Mail className="w-4 h-4" /> Message
              </Link>
            </div>
          )}
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-center text-base-content/40 py-8 text-sm">No yaps yet.</p>
      ) : (
        posts.map((post) => (
          <YapCard key={post.id} post={post} onLikeToggle={handleLikeToggle} onDelete={handleDelete} />
        ))
      )}

      {/* Edit Profile Modal */}
      {editOpen && (
        <dialog className="modal modal-open" onClick={() => setEditOpen(false)}>
          <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Edit profile</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setEditOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-4">
              <div
                className="relative group cursor-pointer"
                onClick={() => editFileRef.current?.click()}
              >
                <div className="avatar">
                  <div className="w-20 rounded-full ring-2 ring-base-300">
                    {editImageUrl ? (
                      <img src={editImageUrl} alt="Profile" />
                    ) : (
                      <div className="bg-primary text-primary-content flex items-center justify-center text-2xl font-bold w-full h-full">
                        {profile.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              {editUploading && (
                <span className="text-xs text-base-content/50 mt-1 flex items-center gap-1">
                  <span className="loading loading-spinner loading-xs"></span>
                  Uploading...
                </span>
              )}
              <input
                ref={editFileRef}
                type="file"
                accept="image/*"
                onChange={handleEditImageChange}
                className="hidden"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-base-content/70">Name</label>
                <input
                  type="text"
                  className="input input-bordered w-full mt-1"
                  maxLength={50}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-base-content/70">Bio</label>
                <textarea
                  className="textarea textarea-bordered w-full mt-1"
                  maxLength={160}
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Write something about yourself..."
                />
                <span className="text-xs text-base-content/40">{editBio.length}/160</span>
              </div>
            </div>

            <div className="modal-action">
              <button className="btn btn-ghost btn-sm" onClick={() => setEditOpen(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={editSaving || editUploading}>
                {editSaving ? <span className="loading loading-spinner loading-xs"></span> : "Save"}
              </button>
            </div>
          </div>
        </dialog>
      )}

      {/* Followers/Following Modal */}
      {modalType && (
        <dialog className="modal modal-open" onClick={() => setModalType(null)}>
          <div className="modal-box animate-scale-in" onClick={(e) => e.stopPropagation()}>
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
                <span className="loading loading-spinner loading-md text-primary"></span>
              </div>
            ) : modalUsers.length === 0 ? (
              <p className="text-center text-base-content/40 py-8 text-sm">
                {modalType === "followers" ? "No followers yet." : "Not following anyone."}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {modalUsers.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-base-200 transition-colors"
                    onClick={() => setModalType(null)}
                  >
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
                      <span className="font-semibold block text-sm">
                        {u.displayName || u.userName.charAt(0).toUpperCase() + u.userName.slice(1)}
                      </span>
                      <span className="text-xs text-base-content/50">@{u.userName}</span>
                    </div>
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
