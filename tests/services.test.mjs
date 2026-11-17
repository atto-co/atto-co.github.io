import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

test('service catalog identifies actual AttoCo source repositories', () => {
  for (const repo of ['atto-cloud-control-plane.rs', 'atto-build-farm.rs', 'atto-runtime-host.rs', 'atto-deploy.rs', 'atto-observability.rs']) {
    assert.ok(html.includes('https://github.com/atto-co/' + repo), repo);
  }
});
test('commercial service catalog remains explicit about preview status', () => {
  assert.match(html, /planning stage/i);
  assert.match(html, /not evidence of a deployed or production-ready cloud/i);
  assert.match(html, /local execution does not depend on a hosted Atto account/i);
  assert.match(html, /aria-labelledby="cloud-heading"/);
});
test('service catalog does not introduce remote scripts or embedded runtimes', () => {
  assert.doesNotMatch(html, /<script\b|<iframe\b|javascript:/i);
  assert.match(html, /default-src 'none'/);
});