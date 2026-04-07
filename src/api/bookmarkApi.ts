import api from "./axiosInstance";

export const toggleBookmark = (postId: number) => {
  return api.post(`/bookmarks/${postId}`);
};

export const getBookmarks = () => {
  return api.get("/bookmarks");
};
