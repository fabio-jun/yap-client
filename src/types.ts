export interface Post {
  id: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorId: number;
  authorName: string;
  authorProfileImageUrl?: string;
  imageUrl?: string;
  likeCount: number;
  hasLiked: boolean;
  hasBookmarked: boolean;
}

export interface User {
  id: number;
  userName: string;
  displayName?: string;
  email: string;
  role: string;
  createdAt: string;
  profileImageUrl?: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  authorId: number;
  authorName: string;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DirectMessage {
  id: number;
  content: string;
  createdAt: string;
  senderId: number;
  senderName: string;
  senderProfileImageUrl?: string;
  receiverId: number;
  receiverName: string;
  receiverProfileImageUrl?: string;
}

export interface ConversationPreview {
  userId: number;
  userName: string;
  profileImageUrl?: string;
  lastMessageContent: string;
  lastMessageDate: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}
