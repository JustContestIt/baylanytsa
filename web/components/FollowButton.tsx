"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

interface FollowButtonProps {
  userId: string;
  isFollowing: boolean;
  onToggle: (following: boolean, followers: number) => void;
}

const FollowButton = ({ userId, isFollowing, onToggle }: FollowButtonProps) => {
  const [pending, setPending] = useState(false);

  const handleClick = async () => {
    setPending(true);
    try {
      const data = await apiFetch<{ following: boolean; followers: number }>(`/api/users/${userId}/follow`, {
        method: "POST"
      });
      onToggle(data.following, data.followers);
    } catch (err) {
      console.error(err);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium transition ${
        isFollowing
          ? "border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      } disabled:cursor-not-allowed`}
    >
      {isFollowing ? "Отписаться" : "Подписаться"}
    </button>
  );
};

export default FollowButton;
