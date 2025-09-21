'use client';

import { useState } from 'react';
import { postJSON } from '@/lib/api';
import useSWR from 'swr';
import { api, fetcherJSON } from '@/lib/api';

export default function CreatePost({ onCreated }: { onCreated?: () => void }) {
  const { data: me } = useSWR(api('/me'), fetcherJSON);
  const [content, setContent] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return alert('Сначала зарегистрируйтесь на /profile');
    if (!content.trim()) return;
    await postJSON('/posts', { content });
    setContent('');
    onCreated?.();
  }

  return (
    <div className="card">
      <form onSubmit={submit} className="space-y-2">
        <textarea
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent p-3 text-sm"
          placeholder={
            me
              ? 'Поделитесь мыслями...'
              : 'Чтобы писать посты — зарегистрируйтесь на /profile'
          }
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <button
            className="rounded-xl px-4 py-2 text-sm bg-gray-900 text-white dark:bg-white dark:text-black"
            disabled={!me}
          >
            Опубликовать
          </button>
          {/* <button
            type="button"
            className="rounded-xl px-4 py-2 text-sm border border-gray-300 dark:border-gray-600"
            onClick={async () => {
              const topic = prompt(
                'Тема для идеи поста (используется серверный AI):',
                'осенний марафон привычек'
              );
              if (!topic) return;
              // серверный вызов
              const res = await postJSON('/ai/generate', { topic });
              if (res?.idea) setContent(res.idea);
            }}
            disabled={!me}
            title="Идея поста с сервера (OpenAI)"
          >
            Сгенерировать идею
          </button> */}
        </div>
      </form>
    </div>
  );
}
