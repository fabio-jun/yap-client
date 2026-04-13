import api from "./axiosInstance";

export const getConversations = () => api.get("/messages");

export const getConversation = (userId: number) => api.get(`/messages/${userId}`);

export const sendMessage = (userId: number, data: { content: string }) =>
  api.post(`/messages/${userId}`, data);

export const deleteMessage = (messageId: number) =>
  api.delete(`/messages/msg/${messageId}`);
