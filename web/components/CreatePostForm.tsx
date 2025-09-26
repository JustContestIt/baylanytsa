"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { Post } from "@/types";

interface CreatePostFormProps {
  onCreated?: (post: Post) => void;
}

const CreatePostForm = ({ onCreated }: CreatePostFormProps) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [topic, setTopic] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Post cannot be empty");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const data = await apiFetch<{ post: Post }>("/api/posts", {
        method: "POST",
        json: { content }
      });
      setContent("");
      onCreated?.(data.post);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Failed to create post";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  const handleGenerateIdea = async () => {
    if (!topic.trim()) {
      setError("Введите тему для генерации");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ idea: string }>("/api/ai/generate", {
        method: "POST",
        json: { topic }
      });
      setContent((prev) => (prev ? `${prev}\n\n${data.idea}` : data.idea));
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Не удалось получить идею";
      setError(message);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="О чём вы думаете?"
        className="w-full resize-none rounded-md border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
        rows={4}
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
          disabled={pending}
        >
          {pending ? "Публикуем..." : "Опубликовать"}
        </button>
        <div className="flex flex-1 items-center gap-2">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Тема для генерации"
            className="flex-1 rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          <button
            type="button"
            onClick={handleGenerateIdea}
            className="rounded-md border px-3 py-2 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            disabled={aiLoading}
          >
            {aiLoading ? "Генерируем..." : "AI идея"}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
};

export default CreatePostForm;
