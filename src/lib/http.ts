export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface HttpOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  rawBody?: string;

  constructor(status: number, message: string, rawBody?: string) {
    super(message);
    this.status = status;
    this.rawBody = rawBody;
  }
}

export async function http<TResponse>(path: string, options: HttpOptions = {}): Promise<TResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  const url = `${baseUrl}${path}`;
  const { method = "GET", token, body, headers = {} } = options;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    let message = `HTTP ${response.status} ${response.statusText}`;
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === "object") {
        message = (parsed.detail as string) || (parsed.message as string) || message;
      }
    } catch {
      // ignore JSON parse errors; fall back to text
      if (text) {
        message = text;
      }
    }
    // For 401, consumers (e.g., AuthContext) should clear auth and possibly redirect.
    throw new ApiError(response.status, message || "Unknown error", text || undefined);
  }
  return (await response.json()) as TResponse;
}
