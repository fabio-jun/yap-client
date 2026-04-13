import api from "./axiosInstance";

export interface LikeStateResponse {
  liked: boolean;
  count: number;
}

export interface LikedUserResponse {
  id: number;
  userName: string;
  displayName?: string;
  profileImageUrl?: string;
}

export const toggleLike = (postId: number) => {
  return api.post<LikeStateResponse>(`/posts/${postId}/likes`);
};

export const getLikes = (postId: number) => {
  return api.get<LikeStateResponse>(`/posts/${postId}/likes`);
};

export const getLikedUsers = (postId: number) => {
  return api.get<LikedUserResponse[]>(`/posts/${postId}/likes/users`);
};
