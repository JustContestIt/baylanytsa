export function api(path: string) {
  const base = (
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
  ).replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}/api${p}`;
}

export async function fetcherJSON(url: string) {
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export async function postJSON(path: string, body: any) {
  const res = await fetch(api(path), {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(String(msg));
  }
  return data;
}
