'use client';

import { postJSON } from '@/lib/api';
import { useState } from 'react';
import clsx from 'clsx';

type Post = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; username: string; displayName?: string | null };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
};

export default function PostCard({
  post,
  onChange,
}: {
  post: Post;
  onChange?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [comment, setComment] = useState('');

  async function toggleLike() {
    setBusy(true);
    try {
      await postJSON(`/posts/${post.id}/like`, {});
      onChange?.();
    } finally {
      setBusy(false);
    }
  }

  async function addComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    setBusy(true);
    try {
      await postJSON(`/posts/${post.id}/comments`, { content: comment });
      setComment('');
      onChange?.();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">
            {post.author.displayName || post.author.username}
          </div>
          <div className="text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      </div>
      <div className="whitespace-pre-wrap text-sm">{post.content}</div>

      <div className="flex items-center gap-3 pt-1">
        <button
          onClick={toggleLike}
          disabled={busy}
          className={clsx(
            'rounded-xl px-3 py-1 text-sm border border-gray-300 dark:border-gray-600',
            post.isLiked &&
              'bg-gray-900 text-white dark:bg-white dark:text-black'
          )}
        >
          ♥ {post.likesCount}
        </button>

        <div className="text-sm text-gray-500">💬 {post.commentsCount}</div>
      </div>

      <form onSubmit={addComment} className="flex items-center gap-2 pt-1">
        <input
          className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
          placeholder="Напишите комментарий…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="rounded-xl px-3 py-2 text-sm border border-gray-300 dark:border-gray-600"
          disabled={busy}
        >
          Отправить
        </button>
      </form>
    </div>
  );
}
