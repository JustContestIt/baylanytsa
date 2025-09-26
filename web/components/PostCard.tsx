"use client";

import { useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { Comment, Post } from "@/types";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string, liked: boolean, likeCount: number) => void;
  onComment?: (postId: string, comment: Comment, commentCount: number) => void;
}

const PostCard = ({ post, onLike, onComment }: PostCardProps) => {
  const [likePending, setLikePending] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentPending, setCommentPending] = useState(false);

  const comments = useMemo(() => [...post.comments].reverse(), [post.comments]);

  const handleLike = async () => {
    setLikePending(true);
    try {
      const data = await apiFetch<{ liked: boolean; likeCount: number }>(`/api/posts/${post.id}/like`, {
        method: "POST"
      });
      onLike?.(post.id, data.liked, data.likeCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLikePending(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentPending(true);
    try {
      const data = await apiFetch<{ comment: Comment; commentCount: number }>(`/api/posts/${post.id}/comments`, {
        method: "POST",
        json: { content: commentText }
      });
      setCommentText("");
      onComment?.(post.id, data.comment, data.commentCount);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentPending(false);
    }
  };

  const createdAt = new Date(post.createdAt).toLocaleString();

  return (
    <article className="space-y-3 rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {post.author.displayName ?? post.author.username}
            <span className="ml-2 text-xs text-slate-500">@{post.author.username}</span>
          </p>
          <p className="text-xs text-slate-500">{createdAt}</p>
        </div>
      </header>
      <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
        <button
          onClick={handleLike}
          disabled={likePending}
          className={`flex items-center gap-1 rounded-md px-2 py-1 transition ${
            post.likedByMe ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" : "hover:bg-slate-100 dark:hover:bg-slate-800"
          } disabled:cursor-not-allowed`}
        >
          <span>❤</span>
          <span>{post._count.likes}</span>
        </button>
        <span>💬 {post._count.comments}</span>
      </div>
      <ul className="space-y-2 border-t pt-3 text-sm dark:border-slate-800">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-md bg-slate-50 p-2 dark:bg-slate-800">
            <p className="font-medium">{comment.author.displayName ?? comment.author.username}</p>
            <p className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleString()}</p>
            <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
          </li>
        ))}
        {comments.length === 0 && <li className="text-xs text-slate-500">Будьте первым, кто оставит комментарий</li>}
      </ul>
      <form onSubmit={handleComment} className="flex items-center gap-2">
        <input
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Комментарий"
          className="flex-1 rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="submit"
          disabled={commentPending}
          className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 dark:bg-slate-200 dark:text-slate-900"
        >
          Отправить
        </button>
      </form>
    </article>
  );
};

export default PostCard;
