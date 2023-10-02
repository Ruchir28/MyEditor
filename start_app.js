const { spawn } = require('child_process');
const fs = require('fs');

const env = { ...process.env };
// Start frontend
const frontend = spawn('npm', ['start'], { cwd: 'frontend', stdio: 'inherit', env: env});

// Start backend
const backend = spawn('npm', ['run', 'smartst'], { cwd: 'backend', stdio: 'inherit', env: env });

frontend.on('exit', (code) => {
    console.log(`Frontend exited with code ${code}`);
});

backend.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
});
