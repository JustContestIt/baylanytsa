export interface UserSummary {
  id: string;
  username: string;
  displayName: string | null;
  bio?: string | null;
  createdAt?: string;
  _count?: {
    followers: number;
    following: number;
    posts: number;
  };
  following?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: UserSummary;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: UserSummary;
  _count: {
    likes: number;
    comments: number;
  };
  comments: Comment[];
  likedByMe: boolean;
}

export interface NotificationItem {
  id: string;
  type: "LIKE" | "COMMENT";
  read: boolean;
  createdAt: string;
  message: string;
  actor?: UserSummary;
  post?: {
    id: string;
    content: string | null;
  } | null;
}
