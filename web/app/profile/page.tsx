"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import useSWRInfinite from "swr/infinite";
import CreatePostForm from "@/components/CreatePostForm";
import FeedSkeleton from "@/components/FeedSkeleton";
import FollowButton from "@/components/FollowButton";
import PostCard from "@/components/PostCard";
import RegisterForm from "@/components/RegisterForm";
import { useAuth } from "@/hooks/useAuth";
import type { Comment, Post, UserSummary } from "@/types";

interface ProfileResponse {
  user: UserSummary;
}

const PAGE_SIZE = 10;

type PostsResponse = {
  posts: Post[];
  nextCursor: string | null;
};

const ProfilePage = () => {
  const searchParams = useSearchParams();
  const { user: me, isLoading: authLoading, mutate: mutateAuth } = useAuth();
  const requestedId = searchParams.get("user");
  const activeUserId = requestedId ?? me?.id ?? null;

  const { data: profileData, isLoading: profileLoading, mutate: mutateProfile } = useSWR<ProfileResponse>(
    activeUserId ? `/api/users/${activeUserId}` : null
  );

  const {
    data: postsData,
    error: postsError,
    setSize,
    mutate: mutatePosts,
    isValidating
  } = useSWRInfinite<PostsResponse>(
    (index, previousPageData) => {
      if (!activeUserId) return null;
      if (previousPageData && !previousPageData.nextCursor && index !== 0) return null;
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("authorId", activeUserId);
      if (index > 0 && previousPageData?.nextCursor) {
        params.set("cursor", previousPageData.nextCursor);
      }
      return `/api/posts?${params.toString()}`;
    },
    {
      revalidateFirstPage: true
    }
  );

  const posts = useMemo(() => postsData?.flatMap((page) => page.posts) ?? [], [postsData]);
  const hasMore = Boolean(postsData && postsData[postsData.length - 1]?.nextCursor);
  const isLoadingPosts = (!postsData && !postsError) || isValidating;
  const profile = profileData?.user;
  const isOwnProfile = profile && me ? profile.id === me.id : false;

  const handlePostCreated = (post: Post) => {
    mutatePosts((current) => {
      if (!current || current.length === 0) {
        return [{ posts: [post], nextCursor: null }];
      }
      return [{ ...current[0], posts: [post, ...current[0].posts] }, ...current.slice(1)];
    }, false);
    mutateProfile(
      (current) =>
        current
          ? {
              user: {
                ...current.user,
                _count: current.user._count
                  ? { ...current.user._count, posts: (current.user._count.posts ?? 0) + 1 }
                  : { followers: 0, following: 0, posts: 1 }
              }
            }
          : current,
      false
    );
  };

  const handleLike = (postId: string, liked: boolean, likeCount: number) => {
    mutatePosts((current) => {
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
    mutatePosts((current) => {
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

  const handleFollowToggle = (following: boolean, followers: number) => {
    mutateProfile(
      (current) =>
        current
          ? {
              user: {
                ...current.user,
                following,
                _count: current.user._count
                  ? { ...current.user._count, followers }
                  : { followers, following: 0, posts: 0 }
              }
            }
          : current,
      false
    );
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <FeedSkeleton />
      </div>
    );
  }

  if (!me) {
    return <RegisterForm onSuccess={() => mutateAuth()} />;
  }

  if (!activeUserId) {
    return <p className="text-sm text-slate-500">Выберите профиль</p>;
  }

  return (
    <div className="space-y-6">
      {profileLoading && <FeedSkeleton />}
      {profile && (
        <section className="space-y-3 rounded-lg border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold">{profile.displayName ?? profile.username}</h1>
              <p className="text-sm text-slate-500">@{profile.username}</p>
            </div>
            {!isOwnProfile && (
              <FollowButton
                userId={profile.id}
                isFollowing={Boolean(profile.following)}
                onToggle={handleFollowToggle}
              />
            )}
          </div>
          {profile.bio && <p className="text-sm text-slate-600 dark:text-slate-300">{profile.bio}</p>}
          <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span>Подписчиков: {profile._count?.followers ?? 0}</span>
            <span>Подписок: {profile._count?.following ?? 0}</span>
            <span>Постов: {profile._count?.posts ?? 0}</span>
          </div>
        </section>
      )}
      {isOwnProfile && <CreatePostForm onCreated={handlePostCreated} />}
      {postsError && <p className="text-sm text-red-500">Не удалось загрузить посты</p>}
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onLike={handleLike} onComment={handleComment} />
        ))}
        {isLoadingPosts && <FeedSkeleton />}
        {!isLoadingPosts && posts.length === 0 && <p className="text-sm text-slate-500">Постов пока нет</p>}
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

export default ProfilePage;
