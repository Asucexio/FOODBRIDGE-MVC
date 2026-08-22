const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const serverDir = path.join(__dirname, '..');
let failed = false;
const failedFiles = [];
let checkedCount = 0;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules and hidden directories
      if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
        walk(fullPath);
      }
    } else if (entry.isFile() && path.extname(entry.name) === '.js') {
      // Skip this check script itself to avoid self-checking
      if (fullPath === __filename) continue;

      console.log(`CHECK: ${fullPath}`);
      checkedCount++;
      try {
        execFileSync(process.execPath, ['--check', fullPath], { stdio: 'inherit' });
      } catch (error) {
        failed = true;
        failedFiles.push(fullPath);
      }
    }
  }
}

walk(serverDir);

console.log(`\nChecked ${checkedCount} file(s).`);
if (failed) {
  console.error(`\nValidation failed for the following file(s):\n${failedFiles.join('\n')}`);
  process.exit(1);
} else {
  console.log('\nAll files passed validation check successfully.');
}

