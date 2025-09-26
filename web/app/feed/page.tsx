"use client";

import { useMemo, useState } from "react";
import useSWRInfinite from "swr/infinite";
import CreatePostForm from "@/components/CreatePostForm";
import FeedSkeleton from "@/components/FeedSkeleton";
import PostCard from "@/components/PostCard";
import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import type { Comment, Post } from "@/types";

const PAGE_SIZE = 10;

type FeedResponse = {
  posts: Post[];
  nextCursor: string | null;
};

const FeedPage = () => {
  const { user, isLoading: authLoading, mutate: mutateAuth } = useAuth();
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");

  const {
    data,
    error,
    setSize,
    mutate,
    isValidating
  } = useSWRInfinite<FeedResponse>(
    (index, previousPageData) => {
      if (previousPageData && !previousPageData.nextCursor && index !== 0) return null;
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      if (search) params.set("q", search);
      if (index > 0 && previousPageData?.nextCursor) {
        params.set("cursor", previousPageData.nextCursor);
      }
      return `/api/posts?${params.toString()}`;
    },
    {
      revalidateFirstPage: true
    }
  );

  const posts = useMemo(() => data?.flatMap((page) => page.posts) ?? [], [data]);
  const isLoading = (!data && !error) || isValidating;
  const hasMore = Boolean(data && data[data.length - 1]?.nextCursor);

  const handleCreated = (post: Post) => {
    mutate((current) => {
      if (!current || current.length === 0) {
        return [{ posts: [post], nextCursor: null }];
      }
      return [{ ...current[0], posts: [post, ...current[0].posts] }, ...current.slice(1)];
    }, false);
  };

  const handleLike = (postId: string, liked: boolean, likeCount: number) => {
    mutate((current) => {
      if (!current) return current;
      return current.map((page) => ({
        ...page,
        posts: page.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: liked,
                _count: { ...post._count, likes: likeCount }
              }
            : post
        )
      }));
    }, false);
  };

  const handleComment = (postId: string, comment: Comment, count: number) => {
    mutate((current) => {
      if (!current) return current;
      return current.map((page) => ({
        ...page,
        posts: page.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                comments: [...post.comments, comment],
                _count: { ...post._count, comments: count }
              }
            : post
        )
      }));
    }, false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(query);
    mutate([], false);
    setSize(1);
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <FeedSkeleton />
      </div>
    );
  }

  if (!user) {
    return <RegisterForm onSuccess={() => mutateAuth()} />;
  }

  return (
    <div className="space-y-6">
      <CreatePostForm onCreated={handleCreated} />
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по ключевым словам или хэштегам"
          className="flex-1 rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button type="submit" className="rounded-md border px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
          Искать
        </button>
      </form>
      {error && <p className="text-sm text-red-500">Не удалось загрузить ленту</p>}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
        ))}
        {isLoading &&
          Array.from({ length: 2 }).map((_, index) => <FeedSkeleton key={`skeleton-${index}`} />)}
        {!isLoading && posts.length === 0 && <p className="text-sm text-slate-500">Пока нет постов. Создайте свой первый!</p>}
      </div>
      {hasMore && (
        <button
          onClick={() => setSize((prev) => prev + 1)}
          className="w-full rounded-md border px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Загрузить ещё
        </button>
      )}
    </div>
  );
};

export default FeedPage;
