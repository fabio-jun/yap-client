import api from "./axiosInstance";

export interface BlockStateResponse {
  blocked: boolean;
}

export interface BlockedUserResponse {
  userId: number;
  userName: string;
  profileImageUrl?: string;
  createdAt: string;
}

export const blockUser = (userId: number) =>
  api.post(`/users/${userId}/block`);

export const unblockUser = (userId: number) =>
  api.delete(`/users/${userId}/block`);

export const getBlockState = (userId: number) =>
  api.get<BlockStateResponse>(`/users/${userId}/block`);

export const getBlockedUsers = () =>
  api.get<BlockedUserResponse[]>("/users/blocked");
