import api from "./axiosInstance";

export interface RepostStateResponse {
  reposted: boolean;
  count: number;
  repostId: number | null;
  quoteContent: string | null;
}

export const toggleRepost = (postId: number) =>
  api.post<RepostStateResponse>(`/posts/${postId}/reposts`);

export const quoteRepost = (postId: number, content: string) =>
  api.post<RepostStateResponse>(`/posts/${postId}/quote-reposts`, { content });

export const getRepostState = (postId: number) =>
  api.get<RepostStateResponse>(`/posts/${postId}/reposts`);
