import api from "./axiosInstance";

export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<{ url: string; type: string }>("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
