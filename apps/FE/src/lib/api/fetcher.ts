export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: string,
  ) {
    super(`API error ${status}: ${body}`);
    this.name = "ApiError";
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

export async function todoFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  return (await res.json()) as T;
}
