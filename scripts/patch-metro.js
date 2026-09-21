const fs = require('fs');
const path = require('path');

const patchTargets = [
  'node_modules/metro-resolver/package.json',
  'node_modules/expo/node_modules/metro-resolver/package.json',
  'node_modules/@expo/cli/node_modules/metro-resolver/package.json',
];

patchTargets.forEach((relativePath) => {
  const fullPath = path.resolve(process.cwd(), relativePath);
  if (fs.existsSync(fullPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
      if (pkg.exports) {
        pkg.exports['./errors/*'] = './src/errors/*.js';
        pkg.exports['./utils/*'] = './src/utils/*.js';
        pkg.exports['./*'] = ['./src/*.js', './src/*/*.js'];
        fs.writeFileSync(fullPath, JSON.stringify(pkg, null, 2), 'utf8');
        console.log(`[patch-metro] Successfully patched ${relativePath}`);
      }
    } catch (err) {
      console.warn(`[patch-metro] Failed to patch ${relativePath}:`, err.message);
    }
  }
});
