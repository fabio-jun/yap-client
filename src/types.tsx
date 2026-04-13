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
  repostCount: number;
  hasReposted: boolean;
  isRepost: boolean;
  repostId?: number;
  repostedByUserId?: number;
  repostedByUserName?: string;
  repostedByProfileImageUrl?: string;
  repostedAt?: string;
  quoteContent?: string;
  originalPostId: number;
  mentionedUsers: MentionedUser[];
}

export interface MentionedUser {
  userId: number;
  userName: string;
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
  parentCommentId?: number;
  replies: Comment[];
  mentionedUsers: MentionedUser[];
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
