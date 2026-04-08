export async function apiCall<T>(endpoint: string, options: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? 'Erreur serveur');
  }
  return res.json() as Promise<T>;
}
