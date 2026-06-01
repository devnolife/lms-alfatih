// Konfigurasi pm2 untuk FunPython (production).
// Jalankan: pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "funpython",
      cwd: __dirname,
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3007",
      },
      max_memory_restart: "1G",
      autorestart: true,
    },
  ],
};
