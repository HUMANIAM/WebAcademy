const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));

      let message = `HTTP ${response.status}: ${response.statusText}`;

      const detail = (errorData as any)?.detail;

      if (typeof detail === "string") {
       message = detail;
      } else if (Array.isArray(detail)) {
      // FastAPI validation errors: [{loc, msg, type}, ...]
      message = detail
      .map((d: any) => d.msg || d.message || JSON.stringify(d))
      .join("; ");
    } else if (detail && typeof detail === "object") {
      message =
        (detail as any).message ||
        (detail as any).error ||
        JSON.stringify(detail);
  }

  throw new ApiError(response.status, message);
}

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
