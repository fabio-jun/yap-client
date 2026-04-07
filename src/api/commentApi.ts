import api from "./axiosInstance";

// Fetches all comments for a specific post (public)
export const getCommentsByPost = (postId: number) => {
    return api.get(`posts/${postId}/comments`);
};

export const createComment = (postId: number, data: { content: string }) => {
    return api.post(`/posts/${postId}/comments`, data);
};

export const deleteComment = (postId: number, commentId: number) => {
    return api.delete(`/posts/${postId}/comments/${commentId}`);
};

