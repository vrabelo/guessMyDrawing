import { createApp } from "./app";
import { attachWebSocket } from "./ws";

const PORT = Number(process.env.PORT) || 3001;
const WEB_URL = process.env.WEB_URL || "http://localhost:5173";

function printRunInstructions(port: number): void {
  const line = "========================================";
  console.log(`
${line}
  Tipp my draw – futtatás
${line}
  Backend:   http://localhost:${port}
  Frontend:  ${WEB_URL}
  WebSocket: ws://localhost:${port}/ws?token=...
  Login:     Bela/bela | Feri/feri | Tibi/tibi

  Külön indítás:
    npm run dev:api
    npm run dev:web

  Együtt (root):
    npm run dev
${line}
`);
}

const { app, authService, drawingService } = createApp();
const server = app.listen(PORT, () => {
  printRunInstructions(PORT);
});
attachWebSocket(server, authService, drawingService);
