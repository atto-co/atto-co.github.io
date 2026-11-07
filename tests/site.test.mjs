import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('company links to language-owned playground entry, not a server compiler',()=>{
  assert.match(html,/https:\/\/atto-lang\.github\.io\/play\//);
  assert.match(html,/not proof of full language/i);
  assert.match(html,/independently verified static deployment/i);
});
test('company site has restrictive CSP and no embedded code execution',()=>{
  assert.match(html,/default-src 'none'/);
  assert.doesNotMatch(html,/<script\b|<iframe\b|javascript:/i);
  assert.match(html,/<html lang="en">/);
});

test('Pages publishing is main-push-only, exact-head and symlink-safe', async () => {
  const workflow = await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /branches: \[main\]/);
  assert.doesNotMatch(workflow, /workflow_dispatch:/);
  assert.match(workflow, /if: github\.ref == 'refs\/heads\/main' && github\.event_name == 'push'/);
  assert.match(workflow, /test "\$\(git rev-parse HEAD\)" = "\$GITHUB_SHA"/);
  assert.match(workflow, /test ! -L "\$path"/);
  assert.match(workflow, /test ! -L "\$directory"/);
  assert.match(workflow, /release-manifest\.sha256/);
  assert.doesNotMatch(workflow, /cp -R|cp -r|rsync|cp --parents \*|upload-pages-artifact@main/);
});

test('public package includes an intact playground handoff', async () => {
  const handoff = await readFile(new URL('../play/index.html', import.meta.url), 'utf8');
  assert.match(handoff, /<meta http-equiv="refresh" content="0;url=https:\/\/atto-lang\.github\.io\/play\/">/);
  assert.match(handoff, /<link rel="canonical" href="https:\/\/atto-lang\.github\.io\/play\/">/);
  assert.match(handoff, /<a href="https:\/\/atto-lang\.github\.io\/play\/">/);
  assert.doesNotMatch(handoff, /<script\b|<iframe\b|javascript:/i);
  const workflow = await readFile(new URL('../.github/workflows/pages.yml', import.meta.url), 'utf8');
  assert.match(workflow, /for path in index\.html site\.css play\/index\.html; do/);
  assert.match(workflow, /test "\$\(find _site -type f \| wc -l\)" -eq 3/);
  assert.match(workflow, /sha256sum index\.html site\.css play\/index\.html > release-manifest\.sha256/);
  assert.match(workflow, /test -s _site\/play\/index\.html/);
});
