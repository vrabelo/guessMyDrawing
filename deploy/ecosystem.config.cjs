// VPS production process manager
// Usage (from repo root, after npm run build):
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save && pm2 startup

module.exports = {
  apps: [
    {
      name: "tipp-my-draw-api",
      cwd: "./apps/api",
      script: "dist/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        WEB_URL: "https://guessmydraw.duckdns.org",
      },
      // Restart if memory grows (drawings as data URLs inflate db.json)
      max_memory_restart: "512M",
      time: true,
    },
  ],
};
