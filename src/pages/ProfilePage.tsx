import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Ban, BellOff, Camera, Flag, Info, Link2, Mail, MoreHorizontal, X } from "lucide-react";
import toast from "react-hot-toast";
import { getUserById, updateProfile } from "../api/userApi";
import { getPostsByUser } from "../api/postApi";
import { getFollowers, getFollowing, toggleFollow } from "../api/followApi";
import { blockUser, getBlockState, unblockUser } from "../api/blockApi";
import { getUploadErrorMessage, SUPPORTED_IMAGE_ACCEPT, uploadFile } from "../api/uploadApi";
import { useAuth } from "../hooks/useAuth";
import ConfirmModal from "../components/ConfirmModal";
import ReportModal from "../components/ReportModal";
import YapCard from "../components/YapCard";
import AvatarFallback from "../components/AvatarFallback";
import type { Post, User } from "../types";

const profileTabs = ["Posts", "Replies", "Media", "Likes"] as const;
type ProfileTab = (typeof profileTabs)[number];

async function copyText(text: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

function profileLabel(profile: User) {
  return profile.displayName || profile.userName.charAt(0).toUpperCase() + profile.userName.slice(1);
}

export default function ProfilePage() {
  const { id } = useParams();
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const editFileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSilenced, setIsSilenced] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>("Posts");
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following" | null>(null);
  const [modalUsers, setModalUsers] = useState<User[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editUploading, setEditUploading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const userId = Number(id);
  const isOwnProfile = authUser && String(userId) === authUser.id;

  useEffect(() => {
    if (!userId) return;

    getUserById(userId).then((res) => setProfile(res.data));
    getPostsByUser(userId).then((res) => setPosts(res.data));

    if (authUser && String(userId) !== authUser.id) {
      getBlockState(userId)
        .then((res) => setIsBlocked(res.data.blocked))
        .catch(() => setIsBlocked(false));
    } else {
      setIsBlocked(false);
    }
  }, [authUser, userId]);

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
    } catch (error) {
      toast.error(getUploadErrorMessage(error, "Failed to upload image."));
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
    if (isBlocked || !profile) return;
    const res = await toggleFollow(userId);
    setIsFollowing(res.data.following);
    setProfile({
      ...profile,
      followersCount: profile.followersCount + (res.data.following ? 1 : -1),
    });
    toast(res.data.following ? "Followed!" : "Unfollowed");
  };

  const handleBlock = async () => {
    try {
      await blockUser(userId);
      setIsBlocked(true);
      setIsFollowing(false);
      setPosts([]);
      toast.success("User blocked.");
    } catch {
      toast.error("Could not block user.");
    } finally {
      setConfirmBlock(false);
    }
  };

  const handleUnblock = async () => {
    try {
      await unblockUser(userId);
      setIsBlocked(false);
      const res = await getPostsByUser(userId);
      setPosts(res.data);
      toast.success("User unblocked.");
    } catch {
      toast.error("Could not unblock user.");
    }
  };

  const handleLikeToggle = (postId: number, liked: boolean, count: number) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hasLiked: liked, likeCount: count } : p)));
  };

  const handleDelete = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const handleRepostToggle = (postId: number, reposted: boolean, count: number) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, hasReposted: reposted, repostCount: count } : p)));
  };

  const handleAboutAccount = () => {
    if (!profile) return;
    toast(`Joined ${new Date(profile.createdAt).toLocaleDateString()}`);
    setMenuOpen(false);
  };

  const handleCopyProfileLink = async () => {
    try {
      await copyText(`${window.location.origin}/profile/${userId}`);
      toast.success("Profile link copied.");
    } catch {
      toast.error("Could not copy profile link.");
    } finally {
      setMenuOpen(false);
    }
  };

  const handleToggleSilence = () => {
    setIsSilenced((current) => {
      const next = !current;
      toast(next ? `Silenced @${profile?.userName}` : `Unsilenced @${profile?.userName}`);
      return next;
    });
    setMenuOpen(false);
  };

  if (!profile) {
    return (
      <div className="animate-pulse">
        <div className="border-b border-base-300 px-4 pb-5 pt-3">
          <div className="flex justify-center">
            <div className="h-7 w-36 rounded-full bg-base-300" />
          </div>
          <div className="mt-3 h-40 rounded-none bg-base-300/70" />
          <div className="relative px-1 pb-2 pt-8">
            <div className="absolute -top-12 left-4 h-24 w-24 rounded-full bg-base-300 ring-4 ring-base-100" />
            <div className="ml-auto flex w-fit gap-2">
              <div className="h-10 w-28 rounded-2xl bg-base-300" />
              <div className="h-10 w-24 rounded-2xl bg-base-300" />
            </div>
            <div className="mt-4 h-8 w-40 rounded bg-base-300" />
            <div className="mt-2 h-5 w-24 rounded bg-base-300" />
            <div className="mt-4 h-5 w-72 rounded bg-base-300" />
          </div>
        </div>
      </div>
    );
  }

  const visiblePosts = activeTab === "Media" ? posts.filter((post) => Boolean(post.imageUrl)) : posts;
  const emptyTabMessage =
    activeTab === "Replies"
      ? "Replies will appear here soon."
      : activeTab === "Likes"
        ? "Likes will appear here soon."
        : activeTab === "Media"
          ? "No media yet."
          : "No yaps yet.";

  return (
    <div className="animate-fade-in">
      <div className="border-b border-base-300 px-4 pb-0 pt-3">
        <div className="-mx-4">
          <div className="h-40 overflow-hidden bg-gradient-to-br from-primary/30 to-base-300">
            {profile.coverImageUrl ? (
              <img src={profile.coverImageUrl} alt="Cover" className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>

        <div className="relative px-1 pb-5 pt-8">
          <div className="absolute -top-12 left-4 rounded-full bg-base-100 p-1">
            <div className="h-24 w-24 overflow-hidden rounded-full ring-2 ring-base-100">
              {profile.profileImageUrl ? (
                <img src={profile.profileImageUrl} alt={profile.userName} className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback label={profile.userName} className="text-[2.15rem]" />
              )}
            </div>
          </div>

          {isOwnProfile ? (
            <div className="flex justify-end gap-2">
              <button className="btn btn-ghost h-10 min-h-0 rounded-2xl border border-base-300 px-5 text-base font-semibold" onClick={openEditModal}>
                Edit profile
              </button>
              <button
                className="btn btn-ghost h-10 min-h-0 rounded-2xl border border-base-300 px-5 text-base font-semibold text-error"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Log out
              </button>
            </div>
          ) : authUser ? (
            <div className="relative flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost h-10 min-h-0 rounded-2xl border border-base-300 px-3"
                onClick={() => setMenuOpen((open) => !open)}
                aria-expanded={menuOpen}
                aria-label="More profile actions"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              <Link
                to={`/messages/${userId}`}
                className={`btn btn-ghost h-10 min-h-0 rounded-2xl border border-base-300 px-3 ${isBlocked ? "btn-disabled" : ""}`}
              >
                <Mail className="h-4 w-4" />
              </Link>
              <button
                type="button"
                className="btn btn-primary h-10 min-h-0 rounded-2xl border-none px-6 text-base font-bold shadow-none"
                onClick={handleFollow}
                disabled={isBlocked}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>

              {menuOpen ? (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-64 overflow-hidden rounded-2xl border border-base-300 bg-base-100 shadow-xl">
                    <button type="button" className="flex w-full items-center gap-3 border-b border-base-300 px-4 py-3 text-left text-sm transition-colors hover:bg-base-200" onClick={handleAboutAccount}>
                      <Info className="h-4 w-4" />
                      About account
                    </button>
                    <button type="button" className="flex w-full items-center gap-3 border-b border-base-300 px-4 py-3 text-left text-sm transition-colors hover:bg-base-200" onClick={handleCopyProfileLink}>
                      <Link2 className="h-4 w-4" />
                      Copy link to profile
                    </button>
                    <button type="button" className="flex w-full items-center gap-3 border-b border-base-300 px-4 py-3 text-left text-sm transition-colors hover:bg-base-200" onClick={handleToggleSilence}>
                      <BellOff className="h-4 w-4" />
                      {isSilenced ? `Unsilence @${profile.userName}` : `Silence @${profile.userName}`}
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 border-b border-base-300 px-4 py-3 text-left text-sm text-error transition-colors hover:bg-base-200"
                      onClick={() => {
                        setMenuOpen(false);
                        if (isBlocked) {
                          handleUnblock();
                        } else {
                          setConfirmBlock(true);
                        }
                      }}
                    >
                      <Ban className="h-4 w-4" />
                      {isBlocked ? `Unblock @${profile.userName}` : `Block @${profile.userName}`}
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-error transition-colors hover:bg-base-200"
                      onClick={() => {
                        setMenuOpen(false);
                        setReportOpen(true);
                      }}
                    >
                      <Flag className="h-4 w-4" />
                      {`Report @${profile.userName}`}
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <h1 className="text-[2rem] font-bold tracking-tight text-base-content">{profileLabel(profile)}</h1>
            <p className="text-[1.02rem] text-base-content/50">@{profile.userName}</p>
            {profile.bio ? (
              <p className="mt-3 max-w-[34rem] text-[1.05rem] leading-relaxed text-base-content/78">{profile.bio}</p>
            ) : null}
          </div>

          <div className="mt-4 flex gap-6">
            {[
              { label: "Followers", count: profile.followersCount, action: () => openModal("followers") },
              { label: "Following", count: profile.followingCount, action: () => openModal("following") },
              { label: "Yaps", count: profile.postCount ?? posts.length },
            ].map(({ label, count, action }) => (
              <button key={label} type="button" className="text-left transition-colors hover:text-base-content" onClick={action}>
                <span className="text-[1.1rem] font-bold text-base-content">{count}</span>
                <span className="ml-1 text-[1.02rem] text-base-content/50">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex border-t border-base-300">
          {profileTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className="relative flex-1 py-4 text-center text-[1.05rem] font-semibold transition-colors hover:bg-base-200/30"
              onClick={() => setActiveTab(tab)}
            >
              <span className={activeTab === tab ? "text-base-content" : "text-base-content/50"}>{tab}</span>
              {activeTab === tab ? <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" /> : null}
            </button>
          ))}
        </div>
      </div>

      {isBlocked ? (
        <div className="px-4 py-12 text-center">
          <Ban className="mx-auto mb-3 h-8 w-8 text-base-content/30" />
          <p className="font-semibold text-base-content">Blocked</p>
          <p className="mt-1 text-sm text-base-content/50">Yaps from this account are hidden.</p>
        </div>
      ) : activeTab === "Replies" || activeTab === "Likes" ? (
        <p className="px-4 py-10 text-center text-sm text-base-content/40">{emptyTabMessage}</p>
      ) : visiblePosts.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm text-base-content/40">{emptyTabMessage}</p>
      ) : (
        visiblePosts.map((post) => (
          <YapCard
            key={post.isRepost ? `repost-${post.repostId}` : `post-${post.id}`}
            post={post}
            onLikeToggle={handleLikeToggle}
            onDelete={handleDelete}
            onRepostToggle={handleRepostToggle}
          />
        ))
      )}

      <ConfirmModal
        open={confirmBlock}
        title="Block this user?"
        description="Their yaps will be hidden from your feed."
        onConfirm={handleBlock}
        onCancel={() => setConfirmBlock(false)}
      />

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} reportedUserId={userId} />

      {editOpen ? (
        <dialog className="modal modal-open" onClick={() => setEditOpen(false)}>
          <div className="modal-box max-w-sm animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Edit profile</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setEditOpen(false)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4 flex flex-col items-center">
              <div className="group relative cursor-pointer" onClick={() => editFileRef.current?.click()}>
                <div className="avatar">
                  <div className="w-20 rounded-full ring-2 ring-base-300">
                    {editImageUrl ? (
                      <img src={editImageUrl} alt="Profile" />
                    ) : (
                      <AvatarFallback label={profile.userName} className="text-2xl" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </div>
              {editUploading ? (
                <span className="mt-1 flex items-center gap-1 text-xs text-base-content/50">
                  <span className="loading loading-spinner loading-xs" />
                  Uploading...
                </span>
              ) : null}
              <input ref={editFileRef} type="file" accept={SUPPORTED_IMAGE_ACCEPT} onChange={handleEditImageChange} className="hidden" />
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-base-content/70">Name</label>
                <input
                  type="text"
                  className="input input-bordered mt-1 w-full"
                  maxLength={50}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Display name"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-base-content/70">Bio</label>
                <textarea
                  className="textarea textarea-bordered mt-1 w-full"
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
              <button className="btn btn-ghost btn-sm" onClick={() => setEditOpen(false)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={handleEditSave} disabled={editSaving || editUploading}>
                {editSaving ? <span className="loading loading-spinner loading-xs" /> : "Save"}
              </button>
            </div>
          </div>
        </dialog>
      ) : null}

      {modalType ? (
        <dialog className="modal modal-open" onClick={() => setModalType(null)}>
          <div className="modal-box animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{modalType === "followers" ? "Followers" : "Following"}</h3>
              <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setModalType(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-md text-primary" />
              </div>
            ) : modalUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-base-content/40">
                {modalType === "followers" ? "No followers yet." : "Not following anyone."}
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {modalUsers.map((u) => (
                  <Link
                    key={u.id}
                    to={`/profile/${u.id}`}
                    className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-base-200"
                    onClick={() => setModalType(null)}
                  >
                    <div className="avatar">
                      <div className="w-10 rounded-full ring-2 ring-base-300">
                        {u.profileImageUrl ? (
                          <img src={u.profileImageUrl} alt={u.userName} />
                        ) : (
                          <AvatarFallback label={u.userName} className="text-sm" />
                        )}
                      </div>
                    </div>
                    <div>
                      <span className="block text-sm font-semibold">{profileLabel(u)}</span>
                      <span className="text-xs text-base-content/50">@{u.userName}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </dialog>
      ) : null}
    </div>
  );
}
