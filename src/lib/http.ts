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
  const rawBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (!rawBase && process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set in production – cannot call backend");
  }
  const baseUrl = rawBase;
  const url = `${baseUrl}${path}`;
  const { method = "GET", token, body, headers = {} } = options;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const headersToSend: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
  if (!isFormData) {
    headersToSend["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }

  const response = await fetch(url, {
    method,
    headers: headersToSend,
    body: body ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
    cache: "no-store",
  });

  if (response.ok) {
    return (await response.json()) as TResponse;
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";
  const isHtml = contentType.includes("text/html");
  let message = `HTTP ${response.status} ${response.statusText}`;

  if (!isHtml && text) {
    try {
      const parsed = text ? JSON.parse(text) : null;
      if (parsed && typeof parsed === "object") {
        message = (parsed.detail as string) || (parsed.message as string) || message;
      }
    } catch {
      if (text.length < 300) {
        message = text;
      } else {
        message = `${message} (backend returned a large error body)`;
      }
    }
  } else if (isHtml) {
    message = `${message} (backend returned HTML error page)`;
  }

  throw new ApiError(response.status, message || "Unknown error", text || undefined);
}
