import { defineConfig } from 'pm2';

export default defineConfig({
  apps: [
    {
      name: 'pdf-service',
      script: 'src/app.js',
      exec_mode: 'cluster',
      instances: 4,
      autorestart: true,
      watch: ['styles/all-pdf-styles', 'styles/documents'],
      ignore_watch: ['node_modules', 'logs', 'output', 'styles_bak'],
      watch_delay: 5000,
    },
  ],
});
