const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sanitizePath(input) {
  return String(input || '')
    .replace(/["']/g, '')
    .replace(/[\r\n]/g, '')
    .trim();
}

function resolveElectronBinary() {
  const executable = process.platform === 'win32' ? 'electron.exe' : 'electron';
  const fallback = path.join(__dirname, 'node_modules', 'electron', 'dist', executable);

  if (fs.existsSync(fallback)) return fallback;

  try {
    const electron = require('electron');
    let resolved = null;
    if (typeof electron === 'string') resolved = electron;
    else if (electron && electron.path) resolved = electron.path;
    if (resolved) {
      const cleaned = path.normalize(sanitizePath(resolved));
      if (fs.existsSync(cleaned)) return cleaned;
    }
  } catch (error) {
    // ignore and fallback to the local dist path
  }
  return fallback;
}

const electronPath = resolveElectronBinary();
const args = process.argv.slice(2);
if (!args.length) args.push('.');
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const result = spawnSync(electronPath, args, {
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error('Failed to start Electron:', result.error);
  process.exit(1);
}

process.exit(result.status || 0);
