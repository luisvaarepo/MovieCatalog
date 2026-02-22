// Small helper used by SWR and components to fetch JSON from the backend.
// Behavior:
// 1. Attempts a same-origin fetch to `/api${url}` which works when Next.js
//    proxies API requests or when the backend is hosted on the same host.
// 2. If the first attempt errors (network error or non-OK response) it falls
//    back to the explicit backend defined by NEXT_PUBLIC_API or
//    `http://localhost:3000`.
// 3. When a 401 is received and we are running in the browser, it triggers a
//    redirect to `/login` so the user can re-authenticate.
// 4. The function preserves any `init` provided and merges an Authorization
//    header when an `access_token` exists in localStorage (browser-only).
export async function fetcher(url: string, init?: RequestInit) {
  const path = `/api${url}`;

  // Browser-only: include Authorization header if token present
  const headers: Record<string, string> = {};
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  // Merge provided init.headers with our computed headers
  const mergedInit: RequestInit = {
    ...init,
    headers: {
      ...(init && (init.headers as Record<string, string>)),
      ...headers,
    },
  };

  // First try: same-origin path
  try {
    const res = await fetch(path, mergedInit);
    if (res.ok) return res.json();

    // Non-OK response: try to read JSON error body to provide a friendly
    // message and detect 401 responses.
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      // Use server-provided message when available but avoid exposing
      // the whole JSON payload to the UI (no JSON.stringify fallback).
      const msg = json?.message || `Request failed ${res.status}`;
      if (json?.statusCode === 401 && typeof window !== 'undefined') {
        // On 401 redirect to login in the browser to prompt for auth.
        window.location.href = '/login';
      }
      throw new Error(msg);
    } catch (e) {
      throw new Error(text || `Request failed ${res.status}`);
    }
  } catch (err) {
    // If network fails, try explicit backend host (useful in dev setups)
    const backend = (process.env.NEXT_PUBLIC_API as string) || 'http://localhost:3000';
    const fallback = `${backend}/api${url}`;
    try {
      const res2 = await fetch(fallback, mergedInit);
      if (!res2.ok) {
        const t = await res2.text();
        try {
          const j = JSON.parse(t);
          // Prefer server message but do not leak full payload
          const m = j?.message || `Request failed ${res2.status} at ${fallback}`;
          if (j?.statusCode === 401 && typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          throw new Error(m);
        } catch (e) {
          throw new Error(t || `Request failed ${res2.status} at ${fallback}`);
        }
      }
      return res2.json();
    } catch (err2) {
      // Log both attempts for easier debugging in dev
      // eslint-disable-next-line no-console
      console.error('API fetch failed', { url, path, fallback, err, err2 });
      throw err2 || err || new Error('Failed to fetch');
    }
  }
}
