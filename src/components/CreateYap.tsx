import { useState, useRef } from "react";
import { createPost } from "../api/postApi";
import { getUploadErrorMessage, SUPPORTED_MEDIA_ACCEPT, uploadFile } from "../api/uploadApi";
import { X, ImagePlus, Video } from "lucide-react";
import toast from "react-hot-toast";
import type { Post } from "../types";
import { useAuth } from "../hooks/useAuth";
import AvatarFallback from "./AvatarFallback";

interface CreateYapProps {
  onCreated: (post: Post) => void;
}

export default function CreateYap({ onCreated }: CreateYapProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaIsVideo, setMediaIsVideo] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxLength = 280;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = `${ta.scrollHeight}px`;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaIsVideo(file.type.startsWith("video/"));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaIsVideo(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      let imageUrl: string | undefined;
      if (mediaFile) {
        try {
          const uploadRes = await uploadFile(mediaFile);
          imageUrl = uploadRes.data.url;
        } catch (error) {
          toast.error(getUploadErrorMessage(error, "Failed to upload media."));
          return;
        }
      }

      const res = await createPost({ content, imageUrl });
      onCreated(res.data);
      setContent("");
      removeMedia();
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      toast.success("Yap posted!");
    } catch {
      toast.error("Failed to create yap.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = maxLength - content.length;
  const progress = content.length / maxLength;
  const circumference = 2 * Math.PI * 10;
  const strokeDashoffset = circumference * (1 - progress);
  return (
    <form onSubmit={handleSubmit} className="border-b border-base-300 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <AvatarFallback label={user?.email ?? ""} className="text-sm" />
        </div>
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            className="w-full resize-none overflow-hidden bg-transparent text-[16px] leading-relaxed text-base-content outline-none placeholder:text-base-content/36"
            placeholder="What's happening?"
            value={content}
            onChange={handleContentChange}
            maxLength={maxLength}
            rows={2}
          />

          {mediaPreview && (
            <div className="relative mt-3 animate-scale-in">
              {mediaIsVideo ? (
                <video src={mediaPreview} className="max-h-64 w-full rounded-[14px] object-cover" controls />
              ) : (
                <img src={mediaPreview} alt="Preview" className="max-h-64 w-full rounded-[14px] object-cover" />
              )}
              <button
                type="button"
                className="btn btn-circle btn-xs btn-error absolute right-2 top-2 shadow-lg"
                onClick={removeMedia}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm min-h-0 rounded-[10px] px-2 text-primary transition-colors hover:bg-primary/10 hover:text-primary"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Add media"
              >
                <ImagePlus className="w-5 h-5" />
                <Video className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={SUPPORTED_MEDIA_ACCEPT}
                onChange={handleFileChange}
                className="hidden"
              />
              {content.length > 0 && (
                <div className="flex items-center gap-1.5 animate-fade-in">
                  <svg width="24" height="24" viewBox="0 0 24 24" className="-rotate-90">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" className="text-base-300" />
                    <circle
                      cx="12" cy="12" r="10" fill="none" strokeWidth="2"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className={`transition-colors duration-200 ${remaining <= 0 ? "text-error" : remaining <= 20 ? "text-warning" : "text-primary"}`}
                    />
                  </svg>
                  {remaining <= 20 && (
                    <span className={`text-xs font-semibold ${remaining <= 0 ? "text-error" : "text-warning"}`}>
                      {remaining}
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              type="submit"
              className={`btn h-9 min-h-0 rounded-[10px] border-none px-5 text-[14px] font-bold shadow-none transition-colors ${
                content.trim() && remaining >= 0 && !submitting
                  ? "btn-primary"
                  : "bg-base-300 text-base-content/34"
              }`}
              disabled={!content.trim() || remaining < 0 || submitting}
            >
              {submitting ? <span className="loading loading-spinner loading-xs"></span> : "Yap"}
            </button>
          </div>
          {error && <p className="text-error text-sm mt-2">{error}</p>}
        </div>
      </div>
    </form>
  );
}
