import axios from "axios";
import api from "./axiosInstance";

export const SUPPORTED_IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
].join(",");

export const SUPPORTED_MEDIA_ACCEPT = [
  SUPPORTED_IMAGE_ACCEPT,
  "video/mp4",
  "video/webm",
  "video/quicktime",
].join(",");

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ url: string; type: string }>("/upload", formData);
};

export const getUploadErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error) && typeof error.response?.data === "string") {
    return error.response.data;
  }

  return fallback;
};
