import type { NotificationItem } from "@/types";

interface NotificationListProps {
  items: NotificationItem[];
}

const NotificationList = ({ items }: NotificationListProps) => {
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed p-6 text-center text-sm text-slate-500 dark:border-slate-700">Уведомлений пока нет</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((notification) => (
        <li
          key={notification.id}
          className={`rounded-lg border p-4 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900 ${
            notification.read ? "opacity-80" : ""
          }`}
        >
          <p className="text-sm font-medium">{notification.message}</p>
          {notification.actor && (
            <p className="text-xs text-slate-500">{notification.actor.displayName ?? notification.actor.username}</p>
          )}
          <p className="text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString()}</p>
        </li>
      ))}
    </ul>
  );
};

export default NotificationList;
