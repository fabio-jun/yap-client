import { useState, useRef } from "react";
import { createPost } from "../api/postApi";
import { uploadImage } from "../api/uploadApi";
import { X, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";
import type { Post } from "../types";

interface CreateYapProps {
  onCreated: (post: Post) => void;
}

export default function CreateYap({ onCreated }: CreateYapProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 280;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    setSubmitting(true);

    try {
      let imageUrl: string | undefined;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.data.url;
      }

      const res = await createPost({ content, imageUrl });
      onCreated(res.data);
      setContent("");
      removeImage();
      toast.success("Yap posted!");
    } catch {
      toast.error("Failed to create yap.");
    } finally {
      setSubmitting(false);
    }
  };

  const remaining = maxLength - content.length;

  return (
    <form onSubmit={handleSubmit} className="card bg-base-200 p-4 mb-4">
      <textarea
        className="textarea textarea-bordered w-full text-base resize-none"
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={maxLength}
        rows={3}
      />

      {imagePreview && (
        <div className="relative mt-2">
          <img src={imagePreview} alt="Preview" className="rounded-xl max-h-64 w-full object-cover" />
          <button
            type="button"
            className="btn btn-circle btn-xs btn-error absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImagePlus className="w-5 h-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className={`text-sm ${remaining <= 20 ? "text-warning" : ""} ${remaining <= 0 ? "text-error" : "text-base-content/50"}`}>
            {remaining}
          </span>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={!content.trim() || remaining < 0 || submitting}
        >
          {submitting ? <span className="loading loading-spinner loading-xs"></span> : "Yap"}
        </button>
      </div>
      {error && <p className="text-error text-sm mt-2">{error}</p>}
    </form>
  );
}
