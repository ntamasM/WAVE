// Patches velopack's load.js to add a `win32-ia32-msvc` alias.
//
// Why: Velopack's load.js uses platform key `"win32-x86-msvc"`, but the
// @neon-rs/load dispatcher reports `process.arch === 'ia32'` as
// `"win32-ia32-msvc"`. The mismatch crashes 32-bit Windows builds with
// `no precompiled module found for win32-ia32-msvc`.
//
// Idempotent: re-running has no effect once the alias is present.

const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'node_modules', 'velopack', 'lib', 'load.js');

if (!fs.existsSync(file)) {
  console.log('[patch-velopack] velopack/lib/load.js not present — skipping');
  process.exit(0);
}

let src = fs.readFileSync(file, 'utf8');

if (src.includes('"win32-ia32-msvc"')) {
  console.log('[patch-velopack] already patched');
  process.exit(0);
}

const target = '"win32-x86-msvc": () => require("./native/velopack_nodeffi_win_x86_msvc.node"),';
const replacement =
  '"win32-x86-msvc": () => require("./native/velopack_nodeffi_win_x86_msvc.node"),\n        ' +
  '"win32-ia32-msvc": () => require("./native/velopack_nodeffi_win_x86_msvc.node"),';

if (!src.includes(target)) {
  console.error('[patch-velopack] expected pattern not found — refusing to patch');
  process.exit(1);
}

fs.writeFileSync(file, src.replace(target, replacement), 'utf8');
console.log('[patch-velopack] added win32-ia32-msvc alias to velopack/lib/load.js');
