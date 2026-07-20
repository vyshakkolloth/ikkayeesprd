const fs = require('fs');
const path = require('path');

const devDir = path.join(__dirname, '..', '.next', 'dev');

try {
  if (fs.existsSync(devDir)) {
    fs.rmSync(devDir, { recursive: true, force: true });
    console.log('Successfully cleaned stale .next/dev cache.');
  }
} catch (err) {
  console.warn('Could not clean .next/dev cache:', err.message);
}
