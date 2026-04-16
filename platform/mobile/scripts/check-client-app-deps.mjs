/**
 * Garante que apps/client/package.json declara todas as dependências usadas em:
 * - platform/mobile/shared (exceto __tests__)
 * - platform/mobile/apps/client/src (exceto __tests__)
 *
 * Detecta `import ... from 'x'` e `require('x')`.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const clientPkgPath = path.join(root, 'apps', 'client', 'package.json');

const SCAN_DIRS = [
  path.join(root, 'shared'),
  path.join(root, 'apps', 'client', 'src'),
];

const importRe =
  /^\s*import\s+(?:type\s+)?(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/gm;

const requireRe = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

const SKIP_PREFIXES = [
  '.',
  '@/',
  '@okinawa/',
  '@expo/config',
];

const SKIP_PACKAGES = new Set(['@expo/vector-icons']);

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name === 'node_modules' || name.name.startsWith('.')) continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) {
      if (name.name === '__tests__' || name.name === '__mocks__') continue;
      walk(p, files);
    } else if (/\.(tsx?|jsx?)$/.test(name.name)) {
      files.push(p);
    }
  }
  return files;
}

function pkgNameFromSpecifier(spec) {
  if (spec.startsWith('@/')) return null;
  if (spec.startsWith('@')) {
    const parts = spec.split('/').filter(Boolean);
    if (parts[0] === '@okinawa') return null;
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : spec;
  }
  return spec.split('/')[0];
}

function shouldSkip(spec) {
  if (!spec || spec.startsWith('.')) return true;
  for (const pre of SKIP_PREFIXES) {
    if (spec === pre || spec.startsWith(pre + '/')) return true;
  }
  return false;
}

const files = [];
for (const d of SCAN_DIRS) walk(d, files);

const specifiers = new Set();
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  importRe.lastIndex = 0;
  while ((m = importRe.exec(text)) !== null) {
    const spec = m[1];
    if (!shouldSkip(spec)) specifiers.add(spec);
  }
  requireRe.lastIndex = 0;
  while ((m = requireRe.exec(text)) !== null) {
    const spec = m[1];
    if (!shouldSkip(spec)) specifiers.add(spec);
  }
}

const clientPkg = JSON.parse(fs.readFileSync(clientPkgPath, 'utf8'));
const deps = {
  ...clientPkg.dependencies,
  ...clientPkg.devDependencies,
};

const required = new Set();
for (const spec of specifiers) {
  const pkg = pkgNameFromSpecifier(spec);
  if (pkg && !SKIP_PACKAGES.has(pkg)) required.add(pkg);
}

const builtins = new Set(['react', 'react-dom', 'events']);
const missing = [];
for (const name of [...required].sort()) {
  if (builtins.has(name)) continue;
  if (!deps[name]) missing.push(name);
}

if (missing.length) {
  console.error(
    '[check-client-app-deps] Faltam dependências no apps/client/package.json:'
  );
  for (const n of missing) console.error('  -', n);
  process.exit(1);
}

console.log(
  '[check-client-app-deps] OK —',
  required.size,
  'pacotes externos (shared + client/src) cobertos pelo client.'
);
