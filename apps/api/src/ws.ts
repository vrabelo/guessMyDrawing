import type { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import type { AuthService } from "./services/auth-service";
import type { DrawingService } from "./services/drawing-service";
import type { PublicDrawing } from "@tipp-my-draw/shared";

type Client = {
  ws: WebSocket;
  userId: string;
};

export function attachWebSocket(
  server: Server,
  auth: AuthService,
  drawings: DrawingService
): void {
  const wss = new WebSocketServer({ server, path: "/ws" });
  const clients = new Set<Client>();

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const token = url.searchParams.get("token") ?? undefined;
    const session = auth.resolve(token);
    if (!session) {
      ws.close(4401, "Unauthorized");
      return;
    }

    const client: Client = { ws, userId: session.userId };
    clients.add(client);

    ws.on("close", () => {
      clients.delete(client);
    });
  });

  drawings.onDrawingCreated((drawing: PublicDrawing) => {
    const payload = JSON.stringify({
      type: "drawing.created",
      drawing,
    });
    for (const client of clients) {
      if (client.userId === drawing.uploaderId) continue;
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    }
  });
}
