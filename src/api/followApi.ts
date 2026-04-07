import api from "./axiosInstance";

export const toggleFollow = (userId: number) => {
  return api.post(`/users/${userId}/follow`);
};

export const getFollowers = (userId: number) => {
  return api.get(`/users/${userId}/followers`);
};

export const getFollowing = (userId: number) => {
  return api.get(`/users/${userId}/following`);
};
