const { spawn } = require('child_process');

// Start frontend
const frontend = spawn('npm', ['start'], { cwd: 'frontend', stdio: 'inherit' });

// Start backend
const backend = spawn('npm', ['run', 'smartst'], { cwd: 'backend', stdio: 'inherit' });

frontend.on('exit', (code) => {
    console.log(`Frontend exited with code ${code}`);
});

backend.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
});
