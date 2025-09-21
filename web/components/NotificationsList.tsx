'use client';

type Notification = {
  id: number;
  type: 'LIKE' | 'COMMENT';
  actor: { id: number; username: string; displayName?: string | null };
  postId?: number | null;
  createdAt: string;
  read: boolean;
};

export default function NotificationsList({
  items,
}: {
  items: Notification[];
}) {
  if (!items?.length)
    return <div className="card text-sm text-gray-500">Нет уведомлений</div>;
  return (
    <div className="space-y-3">
      {items.map((n) => (
        <div key={n.id} className="card">
          <div className="text-sm">
            <span className="font-semibold">
              {n.actor.displayName || n.actor.username}
            </span>{' '}
            {n.type === 'LIKE'
              ? 'лайкнул(а) ваш пост'
              : 'прокомментировал(а) ваш пост'}
            {n.postId ? ` (#${n.postId})` : ''}.
          </div>
          <div className="text-xs text-gray-500">
            {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
