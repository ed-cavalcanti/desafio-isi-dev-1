type ApiErrorBody = {
  message?: string;
};

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(path, init);

  if (!response.ok) {
    const body = (await response
      .json()
      .catch(() => null)) as ApiErrorBody | null;

    throw new Error(body?.message ?? "Não foi possível carregar os dados.");
  }

  return response.json() as Promise<T>;
}
