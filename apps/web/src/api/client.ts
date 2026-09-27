import type {
  AvailableDrawing,
  CreateDrawingRequest,
  GuessResponse,
  LeaderboardsResponse,
  LoginRequest,
  LoginResponse,
  PublicDrawing,
  UserDrawingProgress,
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

  availableDrawings(): Promise<AvailableDrawing[]> {
    return request("/api/drawings/available");
  },

  createDrawing(body: CreateDrawingRequest) {
    return request("/api/drawings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  revealHint(
    drawingId: string,
    hint: 1 | 2 | 3
  ): Promise<UserDrawingProgress> {
    return request(`/api/drawings/${drawingId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ revealHint: hint }),
    });
  },

  guess(drawingId: string, guess: string): Promise<GuessResponse> {
    return request(`/api/drawings/${drawingId}/guess`, {
      method: "POST",
      body: JSON.stringify({ guess }),
    });
  },

  leaderboards(): Promise<LeaderboardsResponse> {
    return request("/api/leaderboards");
  },
};

export function createDrawingsSocket(
  onCreated: (drawing: PublicDrawing) => void
): WebSocket | null {
  const token = getStoredToken();
  if (!token) return null;
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  const ws = new WebSocket(
    `${proto}//${window.location.host}/ws?token=${encodeURIComponent(token)}`
  );
  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(String(ev.data)) as {
        type?: string;
        drawing?: PublicDrawing;
      };
      if (data.type === "drawing.created" && data.drawing) {
        onCreated(data.drawing);
      }
    } catch {
      /* ignore */
    }
  };
  return ws;
}
