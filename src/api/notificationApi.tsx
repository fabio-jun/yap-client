import api from "./axiosInstance";

export interface NotificationResponse {
  id: number;
  type: "like" | "comment" | "follow" | "repost" | "reply";
  isRead: boolean;
  createdAt: string;
  actorId: number;
  actorUsername: string;
  actorDisplayName: string | null;
  actorProfileImageUrl: string | null;
  postId: number | null;
  postContentPreview: string | null;
}

export interface PagedNotifications {
  items: NotificationResponse[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const getNotifications = (page: number = 1, pageSize: number = 20) =>
  api.get<PagedNotifications>(`/notifications?page=${page}&pageSize=${pageSize}`);

export const getRecentNotifications = (count: number = 8) =>
  api.get<NotificationResponse[]>(`/notifications/recent?count=${count}`);

export const getUnreadCount = () =>
  api.get<number>("/notifications/unread-count");

export const markAsRead = (id: number) =>
  api.put(`/notifications/${id}/read`);

export const markAllAsRead = () =>
  api.put("/notifications/read-all");

export const deleteNotification = (id: number) =>
  api.delete(`/notifications/${id}`);
