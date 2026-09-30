import type {
  AvailableDrawing,
  CreateDrawingRequest,
  GuessResponse,
  LeaderboardsResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  OwnedDrawing,
  PublicDrawing,
  UpdateDrawingRequest,
  UserDrawingProgress,
  UserStatsResponse,
  AdminLoginResponse,
  AdminStatsResponse,
  AdminDrawingRow,
  AdminUserRow,
} from "@tipp-my-draw/shared";

const TOKEN_KEY = "tipp-my-draw-token";
const USER_KEY = "tipp-my-draw-user";
const ADMIN_TOKEN_KEY = "tipp-my-draw-admin-token";

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

export function getAdminToken(): string | null {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

function saveAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
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

async function adminRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const token = getAdminToken();
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

  async register(body: RegisterRequest): Promise<LoginResponse> {
    const result = await request<LoginResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
    saveSession(result.token, result.user);
    return result;
  },

  availableDrawings(): Promise<AvailableDrawing[]> {
    return request("/api/drawings/available");
  },

  myDrawings(): Promise<OwnedDrawing[]> {
    return request("/api/drawings/mine");
  },

  startDrawingView(drawingId: string): Promise<AvailableDrawing> {
    return request(`/api/drawings/${drawingId}/start`, { method: "POST" });
  },

  postBonusAnswer(drawingId: string): Promise<{ answer: string }> {
    return request(`/api/drawings/${drawingId}/post-bonus-answer`);
  },

  expireDrawing(drawingId: string): Promise<UserDrawingProgress> {
    return request(`/api/drawings/${drawingId}/expire`, { method: "POST" });
  },

  createDrawing(body: CreateDrawingRequest): Promise<OwnedDrawing> {
    return request("/api/drawings", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  updateDrawing(
    id: string,
    body: UpdateDrawingRequest
  ): Promise<OwnedDrawing> {
    return request(`/api/drawings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  revealHint(drawingId: string): Promise<UserDrawingProgress> {
    return request(`/api/drawings/${drawingId}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ revealHint: 1 }),
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

  myStats(): Promise<UserStatsResponse> {
    return request("/api/leaderboards/me");
  },
};

export const adminApi = {
  async login(password: string): Promise<AdminLoginResponse> {
    // Login is unauthenticated — do not send a stale admin token
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        (data as { message?: string }).message ?? `Hiba (${res.status})`
      );
    }
    const result = data as AdminLoginResponse;
    saveAdminToken(result.token);
    return result;
  },

  stats(): Promise<AdminStatsResponse> {
    return adminRequest("/api/admin/stats");
  },

  drawings(q = ""): Promise<AdminDrawingRow[]> {
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return adminRequest(`/api/admin/drawings${qs}`);
  },

  deleteDrawing(id: string): Promise<{ ok: boolean }> {
    return adminRequest(`/api/admin/drawings/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  users(q = ""): Promise<AdminUserRow[]> {
    const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
    return adminRequest(`/api/admin/users${qs}`);
  },

  deleteUser(
    id: string,
    deleteDrawings = false
  ): Promise<{ ok: boolean }> {
    return adminRequest(`/api/admin/users/${encodeURIComponent(id)}`, {
      method: "DELETE",
      body: JSON.stringify({ deleteDrawings }),
    });
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
