import useSWR from "swr";
import type { User } from "@/types";
import { ApiError } from "@/lib/api";

type MeResponse = {
  user: User & {
    _count: {
      followers: number;
      following: number;
      posts: number;
    };
  };
};

export const useAuth = () => {
  const { data, error, isLoading, mutate } = useSWR<MeResponse>("/api/me", {
    shouldRetryOnError: false,
    revalidateOnFocus: false
  });

  const unauthorized = error instanceof ApiError && error.status === 401;

  return {
    user: !unauthorized ? data?.user ?? null : null,
    isLoading,
    error,
    mutate
  };
};
