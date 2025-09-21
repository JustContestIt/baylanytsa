'use client';

import useSWRInfinite from 'swr/infinite';
import { useState } from 'react';
import { fetcherJSON, api } from '@/lib/api';
import PostCard from '@/components/PostCard';
import Skeleton from '../../components/Skeleton';
import CreatePost from '../../components/CreatePost';

type FeedItem = {
  id: number;
  content: string;
  createdAt: string;
  author: { id: number; username: string; displayName?: string | null };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
};

type FeedResponse = { items: FeedItem[]; nextCursor: number | null };

const PAGE_SIZE = 10;

export default function FeedPage() {
  const [q, setQ] = useState('');
  const key = (index: number, prev: FeedResponse | null) => {
    if (prev && prev.nextCursor === null) return null;
    const cursor = index === 0 ? '' : `&cursor=${prev?.nextCursor}`;
    const query = q ? `&q=${encodeURIComponent(q)}` : '';
    return `${api('/posts')}?limit=${PAGE_SIZE}${cursor}${query}`;
  };

  const { data, error, size, setSize, isValidating, mutate } =
    useSWRInfinite<FeedResponse>(key, fetcherJSON, {
      revalidateOnFocus: false,
    });

  const items = data?.flatMap((p) => p.items) ?? [];
  const isLoadingInitial = !data && !error;
  const isEmpty = data && items.length === 0;
  const isReachingEnd =
    data && data.length > 0 && data[data.length - 1]?.nextCursor == null;

  return (
    <div className="space-y-4">
      <div className="card sticky top-4 z-10">
        <div className="flex items-center gap-2">
          <input
            className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm"
            placeholder="Поиск по словам и #хэштегам"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={() => {
              setSize(1); // Reset to first page
              mutate();
            }}
            className="rounded-xl px-4 py-2 text-sm bg-gray-900 text-white dark:bg-white dark:text-black"
          >
            Найти
          </button>
        </div>
      </div>

      <CreatePost
        onCreated={async () => {
          await setSize(1);
          mutate();
        }}
      />

      {isLoadingInitial && (
        <>
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </>
      )}

      {error && (
        <div className="card text-sm text-red-600">Ошибка загрузки ленты</div>
      )}

      {items.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          onChange={async () => {
            await setSize(1);
            mutate();
          }}
        />
      ))}

      {!isLoadingInitial && !isReachingEnd && (
        <button
          onClick={() => setSize(size + 1)}
          className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 py-2 text-sm"
          disabled={isValidating}
        >
          {isValidating ? 'Загрузка...' : 'Загрузить ещё'}
        </button>
      )}

      {isEmpty && (
        <div className="card text-sm text-gray-500">Ничего не найдено</div>
      )}
    </div>
  );
}
