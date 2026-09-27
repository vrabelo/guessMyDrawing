import type {
  CreateDrawingRequest,
  GuessResponse,
  LeaderboardsResponse,
  LoginRequest,
  LoginResponse,
  PublicDrawing,
} from "@tipp-my-draw/shared";

const TOKEN_KEY = "tipp-my-draw-token";
const USER_KEY = "tipp-my-draw-user";

export function getStoredToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): { id: string; alias: string } | null {
  const raw = sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { id: string; alias: string };
  } catch {
    return null;
  }
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

function saveSession(token: string, user: { id: string; alias: string }): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getStoredToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { message?: string }).message ?? `Hiba (${res.status})`
    );
  }
  return data as T;
}

export const api = {
  async login(body: LoginRequest): Promise<LoginResponse> {
    const result = await request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
    saveSession(result.token, result.user);
    return result;
  },

  registerStub(): Promise<{ message: string }> {
    return request("/api/auth/register", { method: "POST", body: "{}" });
  },

  randomDrawing(): Promise<PublicDrawing> {
    return request("/api/drawings/random");
  },

  createDrawing(body: CreateDrawingRequest) {
    return request("/api/drawings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  guess(
    drawingId: string,
    guess: string,
    hintsUsed: number
  ): Promise<GuessResponse> {
    return request(`/api/drawings/${drawingId}/guess`, {
      method: "POST",
      body: JSON.stringify({ guess, hintsUsed }),
    });
  },

  leaderboards(): Promise<LeaderboardsResponse> {
    return request("/api/leaderboards");
  },
};
