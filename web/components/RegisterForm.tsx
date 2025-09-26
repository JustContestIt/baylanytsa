"use client";

import { useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserSummary } from "@/types";

interface RegisterFormProps {
  onSuccess?: (user: UserSummary) => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Введите имя пользователя");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const data = await apiFetch<{ user: UserSummary }>("/api/users/register", {
        method: "POST",
        json: {
          username,
          displayName: displayName || undefined,
          bio: bio || undefined
        }
      });
      onSuccess?.(data.user);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Не удалось зарегистрироваться";
      setError(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">Присоединяйтесь к Bailanysta</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
        className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      <input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Отображаемое имя"
        className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Расскажите о себе (необязательно)"
        className="w-full rounded-md border px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        rows={3}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
        disabled={pending}
      >
        {pending ? "Регистрируем..." : "Создать аккаунт"}
      </button>
    </form>
  );
};

export default RegisterForm;
