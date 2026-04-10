import api from "./axiosInstance";

export const getUserById = (id: number) => {
  return api.get(`/users/${id}`);
};

export const searchUsers = (query: string) => {
  return api.get("/users", { params: { search: query } });
};

export const getSuggestedUsers = () => {
  return api.get("/users/suggested");
};

export const updateProfile = (data: { userName: string; email: string; profileImageUrl?: string; displayName?: string; bio?: string }) => {
  return api.put("/users/me", data);
};
