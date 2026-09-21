const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const res = path.join(dir, file.name);
      if (file.isDirectory()) {
        if (file.name === 'metro-resolver') {
          callback(res);
        } else if (file.name !== '.bin' && file.name !== '.cache' && file.name !== '.git') {
          walkDir(res, callback);
        }
      }
    }
  } catch (err) {
    // Ignore access errors in deep dirs
  }
}

const nodeModulesDir = path.resolve(process.cwd(), 'node_modules');

walkDir(nodeModulesDir, (metroResolverDir) => {
  // 1. Patch package.json
  const pkgPath = path.join(metroResolverDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.exports) {
        pkg.exports['./errors/*'] = './src/errors/*.js';
        pkg.exports['./utils/*'] = './src/utils/*.js';
        pkg.exports['./*'] = ['./src/*.js', './src/*/*.js', './*'];
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
        console.log(`[patch-metro] Patched exports in ${pkgPath}`);
      }
    } catch (err) {
      console.warn(`[patch-metro] Error patching ${pkgPath}:`, err.message);
    }
  }

  // 2. Patch src/index.js (add explicit .js extension to internal requires)
  const indexPath = path.join(metroResolverDir, 'src', 'index.js');
  if (fs.existsSync(indexPath)) {
    try {
      let code = fs.readFileSync(indexPath, 'utf8');
      const oldCode = code;
      code = code.replace(/require\("\.\/errors\/([^".]+)"\)/g, 'require("./errors/$1.js")');
      code = code.replace(/require\("\.\/resolve"\)/g, 'require("./resolve.js")');
      if (code !== oldCode) {
        fs.writeFileSync(indexPath, code, 'utf8');
        console.log(`[patch-metro] Patched require calls in ${indexPath}`);
      }
    } catch (err) {
      console.warn(`[patch-metro] Error patching ${indexPath}:`, err.message);
    }
  }
});
