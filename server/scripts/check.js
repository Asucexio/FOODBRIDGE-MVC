const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const roots = ['config', 'controllers', 'middleware', 'models', 'routes', 'services'];
let failed = false;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && path.extname(entry.name) === '.js') {
      console.log(`CHECK: ${fullPath}`);
      try {
        execFileSync(process.execPath, ['--check', fullPath], { stdio: 'inherit' });
      } catch (error) {
        failed = true;
      }
    }
  }
}

for (const root of roots) {
  const rootPath = path.join(__dirname, '..', root);
  if (fs.existsSync(rootPath) && fs.statSync(rootPath).isDirectory()) {
    walk(rootPath);
  }
}

if (failed) {
  process.exit(1);
}
