import { type FormEvent, useCallback, useEffect, useState } from "react";
import type {
  AdminDrawingRow,
  AdminStatMetric,
  AdminStatsResponse,
  AdminUserRow,
} from "@tipp-my-draw/shared";
import {
  adminApi,
  clearAdminSession,
  getAdminToken,
} from "../api/client";
import { Button } from "../components/ui/Button";
import "../components/admin/admin-screen.css";

type ListTab = "drawings" | "users";

function formatDelta(m: AdminStatMetric): string {
  if (m.delta === 0) return String(m.total);
  const sign = m.delta > 0 ? "+" : "";
  return `${m.total} (${sign}${m.delta})`;
}

function StatCard({ label, metric }: { label: string; metric: AdminStatMetric }) {
  return (
    <div className="admin-stat">
      <p className="admin-stat__label">{label}</p>
      <p className="admin-stat__value">{formatDelta(metric)}</p>
    </div>
  );
}

export function AdminScreen() {
  const [authed, setAuthed] = useState(() => Boolean(getAdminToken()));
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [listTab, setListTab] = useState<ListTab>("drawings");
  const [drawings, setDrawings] = useState<AdminDrawingRow[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [drawingQuery, setDrawingQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [deleteDrawingsToo, setDeleteDrawingsToo] = useState(false);

  const refreshLists = useCallback(async () => {
    const [d, u] = await Promise.all([
      adminApi.drawings(drawingQuery),
      adminApi.users(userQuery),
    ]);
    setDrawings(d);
    setUsers(u);
  }, [drawingQuery, userQuery]);

  const refreshAll = useCallback(async () => {
    const [s, d, u] = await Promise.all([
      adminApi.stats(),
      adminApi.drawings(drawingQuery),
      adminApi.users(userQuery),
    ]);
    setStats(s);
    setDrawings(d);
    setUsers(u);
  }, [drawingQuery, userQuery]);

  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    void (async () => {
      try {
        await refreshLists();
      } catch (err) {
        if (cancelled) return;
        clearAdminSession();
        setAuthed(false);
        setError(err instanceof Error ? err.message : "Session lejárt.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authed, refreshLists]);

  useEffect(() => {
    if (!authed || stats) return;
    let cancelled = false;
    void adminApi
      .stats()
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        clearAdminSession();
        setAuthed(false);
        setError(err instanceof Error ? err.message : "Session lejárt.");
      });
    return () => {
      cancelled = true;
    };
  }, [authed, stats]);

  async function onLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await adminApi.login(password);
      setStats(result.stats);
      setPassword("");
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Belépés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    clearAdminSession();
    setAuthed(false);
    setStats(null);
    setDrawings([]);
    setUsers([]);
  }

  async function onDeleteDrawing(id: string, name: string) {
    if (!window.confirm(`Törlöd a rajzot: „${name}”?`)) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteDrawing(id);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Törlés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteUser(id: string, alias: string) {
    const extra = deleteDrawingsToo ? " A felhasználó képei is törlődnek." : "";
    if (!window.confirm(`Törlöd a usert: „${alias}”?${extra}`)) return;
    setBusy(true);
    setError("");
    try {
      await adminApi.deleteUser(id, deleteDrawingsToo);
      await refreshAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Törlés sikertelen.");
    } finally {
      setBusy(false);
    }
  }

  if (!authed) {
    return (
      <main className="admin-screen">
        <div className="admin-screen__login game-card">
          <h1 className="admin-screen__title">Admin</h1>
          <p className="admin-screen__hint">Jelszóval védett felület.</p>
          <form className="admin-screen__form" onSubmit={onLogin}>
            <label className="admin-screen__field">
              Jelszó
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="admin-screen__input"
              />
            </label>
            {error ? <p className="admin-screen__error">{error}</p> : null}
            <Button
              label={busy ? "…" : "Belépés"}
              variant="outline"
              type="submit"
              disabled={busy || !password}
              fullWidth
            />
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-screen admin-screen--panel">
      <header className="admin-screen__header">
        <h1 className="admin-screen__title">Admin</h1>
        <Button label="Kilépés" variant="ghost" onClick={logout} />
      </header>

      {error ? <p className="admin-screen__error">{error}</p> : null}

      {stats ? (
        <section className="admin-stats game-card shrink-0" aria-label="Statisztikák">
          <p className="admin-screen__section-label">
            Összesítés
            {stats.lastLoginAt
              ? ` · előző belépés: ${new Date(stats.lastLoginAt).toLocaleString("hu-HU")}`
              : " · első belépés"}
          </p>
          <div className="admin-stats__grid">
            <StatCard label="Userek" metric={stats.users} />
            <StatCard label="Képek" metric={stats.drawings} />
            <StatCard label="Tipp pontok" metric={stats.guessPoints} />
            <StatCard label="Rajz pontok" metric={stats.drawPoints} />
          </div>
        </section>
      ) : null}

      <section className="admin-block game-card">
        <div className="admin-block__head">
          <div className="admin-block__tabs" role="tablist" aria-label="Lista">
            <button
              type="button"
              role="tab"
              aria-selected={listTab === "drawings"}
              className={[
                "admin-block__tab",
                listTab === "drawings" ? "admin-block__tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setListTab("drawings")}
            >
              Képek
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={listTab === "users"}
              className={[
                "admin-block__tab",
                listTab === "users" ? "admin-block__tab--active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => setListTab("users")}
            >
              Userek
            </button>
          </div>
          {listTab === "drawings" ? (
            <input
              type="search"
              placeholder="Keresés név / user…"
              value={drawingQuery}
              onChange={(e) => setDrawingQuery(e.target.value)}
              className="admin-screen__input admin-screen__input--search"
            />
          ) : (
            <input
              type="search"
              placeholder="Keresés alias…"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="admin-screen__input admin-screen__input--search"
            />
          )}
        </div>

        {listTab === "users" ? (
          <label className="admin-screen__check">
            <input
              type="checkbox"
              checked={deleteDrawingsToo}
              onChange={(e) => setDeleteDrawingsToo(e.target.checked)}
            />
            User törlésénél a képeket is töröld
          </label>
        ) : null}

        <div className="admin-table-wrap">
          {listTab === "drawings" ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Név</th>
                  <th>Téma</th>
                  <th>User</th>
                  <th>Státusz</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {drawings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table__empty">
                      Nincs találat.
                    </td>
                  </tr>
                ) : (
                  drawings.map((d) => (
                    <tr key={d.id}>
                      <td>{d.name || "—"}</td>
                      <td>{d.theme || "—"}</td>
                      <td>{d.authorAlias}</td>
                      <td>{d.published ? "publikált" : "vázlat"}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-table__danger"
                          disabled={busy}
                          onClick={() => void onDeleteDrawing(d.id, d.name)}
                        >
                          Törlés
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Alias</th>
                  <th>Tipp pont</th>
                  <th>Rajz pont</th>
                  <th>Képek</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin-table__empty">
                      Nincs találat.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.alias}</td>
                      <td>{u.guessPoints}</td>
                      <td>{u.drawPoints}</td>
                      <td>{u.drawingsCount}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-table__danger"
                          disabled={busy}
                          onClick={() => void onDeleteUser(u.id, u.alias)}
                        >
                          Törlés
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}
