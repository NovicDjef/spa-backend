module.exports = {
  apps: [{
    name: 'spa-backend',
    script: 'npm',
    args: 'start',
    cwd: '/apps/spa/spa-backend',
    env: {
      NODE_ENV: 'production',
      PORT: 5000  // Ou un autre port libre
    },
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_restarts: 10,
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    time: true
  }]
};