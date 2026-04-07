import api from "./axiosInstance";

export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ url: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
