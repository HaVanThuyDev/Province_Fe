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
    // Ignore
  }
}

const nodeModulesDir = path.resolve(process.cwd(), 'node_modules');

walkDir(nodeModulesDir, (metroResolverDir) => {
  // 1. Ensure src/errors directory exists and contains FailedToResolveUnsupportedError.js
  const errorsDir = path.join(metroResolverDir, 'src', 'errors');
  if (!fs.existsSync(errorsDir)) {
    fs.mkdirSync(errorsDir, { recursive: true });
  }
  const unsupportedFile = path.join(errorsDir, 'FailedToResolveUnsupportedError.js');
  if (!fs.existsSync(unsupportedFile)) {
    fs.writeFileSync(
      unsupportedFile,
      'class FailedToResolveUnsupportedError extends Error { constructor(m) { super(m); } }\nmodule.exports = { default: FailedToResolveUnsupportedError };\n',
      'utf8'
    );
    console.log(`[patch-metro] Created missing ${unsupportedFile}`);
  }

  // 2. Patch package.json
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

  // 3. Patch src/index.js with robust safe require wrapper
  const indexPath = path.join(metroResolverDir, 'src', 'index.js');
  if (fs.existsSync(indexPath)) {
    try {
      let code = fs.readFileSync(indexPath, 'utf8');
      
      if (!code.includes('function _safeRequire')) {
        const safeHelper = `
function _safeRequire(pathStr, DummyClass) {
  try { return _interopRequireDefault(require(pathStr)); }
  catch (e) { return { default: DummyClass || class DummyError extends Error {} }; }
}
`;
        code = safeHelper + code;
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/errors\/FailedToResolveUnsupportedError(?:\.js)?"\)\s*\)/g, '_safeRequire("./errors/FailedToResolveUnsupportedError.js", class FailedToResolveUnsupportedError extends Error {})');
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/errors\/FailedToResolveNameError(?:\.js)?"\)\s*\)/g, '_safeRequire("./errors/FailedToResolveNameError.js", class FailedToResolveNameError extends Error {})');
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/errors\/FailedToResolvePathError(?:\.js)?"\)\s*\)/g, '_safeRequire("./errors/FailedToResolvePathError.js", class FailedToResolvePathError extends Error {})');
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/errors\/formatFileCandidates(?:\.js)?"\)\s*\)/g, '_safeRequire("./errors/formatFileCandidates.js", function() { return ""; })');
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/errors\/InvalidPackageError(?:\.js)?"\)\s*\)/g, '_safeRequire("./errors/InvalidPackageError.js", class InvalidPackageError extends Error {})');
        code = code.replace(/_interopRequireDefault\(\s*require\("\.\/resolve(?:\.js)?"\)\s*\)/g, '_safeRequire("./resolve.js")');
        
        fs.writeFileSync(indexPath, code, 'utf8');
        console.log(`[patch-metro] Patched safe requires in ${indexPath}`);
      }
    } catch (err) {
      console.warn(`[patch-metro] Error patching ${indexPath}:`, err.message);
    }
  }
});
