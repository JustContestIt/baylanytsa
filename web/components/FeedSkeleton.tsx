const FeedSkeleton = () => {
  return (
    <div className="space-y-3 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="h-4 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="flex gap-3 pt-2">
        <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-6 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    </div>
  );
};

export default FeedSkeleton;
