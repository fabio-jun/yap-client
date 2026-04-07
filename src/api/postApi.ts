import api from "./axiosInstance";

export const getAllPosts = (params?: { search?: string; tag?: string; page?: number; pageSize?: number }) => {
  return api.get("/post", { params });
};

export const getPostById = (id: number) => {
  return api.get(`/post/${id}`);
};

export const createPost = (data: { content: string; imageUrl?: string }) => {
  return api.post("/post", data);
};

export const updatePost = (id: number, data: { content: string; imageUrl?: string }) => {
  return api.put(`/post/${id}`, data);
};

export const deletePost = (id: number) => {
  return api.delete(`/post/${id}`);
};

export const getFeed = () => {
  return api.get("/feed");
};
