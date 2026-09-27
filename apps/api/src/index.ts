import { createApp } from "./app";

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
  Login:     Bela/bela | Feri/feri | Tibi/tibi

  Külön indítás:
    npm run dev:api
    npm run dev:web

  Együtt (root):
    npm run dev
${line}
`);
}

const app = createApp();
app.listen(PORT, () => {
  printRunInstructions(PORT);
});
