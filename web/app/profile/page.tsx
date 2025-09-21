'use client';

import useSWR from 'swr';
import { fetcherJSON, api, postJSON } from '@/lib/api';
import CreatePost from '../../components/CreatePost';

export default function ProfilePage() {
  const { data: me, mutate } = useSWR(api('/me'), fetcherJSON);

  async function register(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get('username') || '').trim();
    const displayName = String(fd.get('displayName') || '').trim();
    if (!username) return alert('Введите username');
    await postJSON('/users/register', { username, displayName });
    await mutate(); // обновить /me
  }

  return (
    <div className="space-y-4">
      {!me ? (
        <div className="card">
          <h2 className="text-lg font-semibold mb-2">Регистрация</h2>
          <form onSubmit={register} className="space-y-3">
            <input
              name="username"
              placeholder="username"
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
            />
            <input
              name="displayName"
              placeholder="Отображаемое имя (необязательно)"
              className="w-full rounded-xl border px-3 py-2 bg-transparent"
            />
            <button className="rounded-xl px-4 py-2 text-sm bg-gray-900 text-white dark:bg-white dark:text-black">
              Войти/Создать
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="card">
            <h2 className="text-lg font-semibold mb-1">
              {me.displayName || me.username}
            </h2>
            <div className="text-sm text-gray-500">@{me.username}</div>
          </div>

          <CreatePost
            onCreated={() => {
              /* noop (лента обновится на /feed) */
            }}
          />
        </div>
      )}
    </div>
  );
}
