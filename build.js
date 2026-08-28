// Vercel build script - runs cd client && npm install && npm run build
const { execSync } = require('child_process');
console.log('Building client...');
execSync('cd client && npm install && npm run build', { stdio: 'inherit' });
console.log('Build complete!');
