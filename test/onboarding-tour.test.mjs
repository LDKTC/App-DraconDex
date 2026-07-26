import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('first-run Nexus creation offers an inline guide choice without a nested confirmation', () => {
  const core = readFileSync(new URL('../src/renderer/core/nexus.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../css/components.css', import.meta.url), 'utf8');
  const welcomeCreateNexus = core.match(/async function welcomeCreateNexus\(\) \{([\s\S]*?)\n\}/)?.[1] || '';

  assert.doesNotMatch(welcomeCreateNexus, /uiConfirm\(/);
  assert.match(core, /id="nx-guide"/);
  assert.match(core, /S\._guideAfterCreate\s*=\s*Boolean\(q\('#nx-guide'\)\?\.checked\)/);
  assert.match(css, /\.fg input\[type="checkbox"\]\{width:auto/);
});
