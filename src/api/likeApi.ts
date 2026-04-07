import api from "./axiosInstance";

export const toggleLike = (postId: number) => {
  return api.post(`/posts/${postId}/likes`);
};

export const getLikes = (postId: number) => {
  return api.get(`/posts/${postId}/likes`);
};
