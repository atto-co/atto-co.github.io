import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, extname } from 'node:path';

// AttoCo links only to the independently released AttoLang playground.
// This source-tree check does NOT certify remote compiler bytes or public HTTPS.
const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'play/index.html'), 'utf8');
const canonical = 'https://atto-lang.github.io/play/';

function meta(name, attr = 'name') {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...html.matchAll(/<meta\s+[^>]*>/gi)]
    .filter(match => new RegExp(`\\b${attr}="${escaped}"`, 'i').test(match[0]));
}
function attr(tag, key) {
  return new RegExp(`\\b${key}="([^"]*)"`, 'i').exec(tag)?.[1];
}
function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(ent => {
    const path = resolve(dir, ent.name);
    if (ent.isDirectory()) return ent.name === '.git' ? [] : walk(path);
    return [path];
  });
}

test('one exact immutable redirect to the canonical HTTPS playground', () => {
  const refresh = meta('refresh', 'http-equiv');
  assert.equal(refresh.length, 1);
  assert.equal(attr(refresh[0][0], 'content'), `0;url=${canonical}`);
  assert.equal((html.match(/<link\s+[^>]*rel="canonical"[^>]*>/gi) ?? []).length, 1);
  assert.match(html, /<link\s+rel="canonical" href="https:\/\/atto-lang\.github\.io\/play\/">/i);
});

test('navigation stays out of AttoCo JS and never posts user source', () => {
  assert.doesNotMatch(html, /<script\b|<iframe\b|<form\b|\bon(?:load|click|error)\s*=|javascript:/i);
  assert.doesNotMatch(html, /\b(fetch|XMLHttpRequest|sendBeacon)\s*\(/i);
  const hrefs = [...html.matchAll(/<a\s+[^>]*href="([^"]+)"[^>]*>/gi)];
  assert.equal(hrefs.length, 1);
  assert.equal(hrefs[0][1], canonical);
  assert.match(hrefs[0][0], /rel="noopener noreferrer"/i);
});

test('static redirect denies scripts and forms with no referrer', () => {
  const csp = meta('Content-Security-Policy', 'http-equiv');
  assert.equal(csp.length, 1);
  const value = attr(csp[0][0], 'content');
  for (const directive of ["default-src 'none'", "base-uri 'none'", "form-action 'none'", "object-src 'none'"])
    assert.ok(value.includes(directive), `missing CSP directive ${directive}`);
  assert.equal(attr(meta('referrer')[0][0], 'content'), 'no-referrer');
  assert.match(attr(meta('robots')[0][0], 'content'), /noindex/);
});

test('no compiler, guest Wasm, or release-candidate source is vendored at AttoCo', () => {
  const files = walk(root).map(path => path.slice(root.length + 1).replaceAll('\\', '/'));
  const forbidden = files.filter(path => /(?:^|\/)(?:release-candidates|node_modules|private-source|src-compiler)(?:\/|$)/i.test(path)
    || ['.wasm', '.wat', '.atto', '.ores'].includes(extname(path).toLowerCase()));
  assert.deepEqual(forbidden, [], `AttoCo must not publish compiler or guest source: ${forbidden}`);
});

test('redirect contract rejects target or policy relaxation (mutation controls)', () => {
  for (const bad of [html.replace(canonical, 'http://atto-lang.github.io/play/'),
    html.replace("default-src 'none'", "default-src 'self'"),
    html.replace('rel="noopener noreferrer"', 'rel="opener"')]) {
    assert.notEqual(bad, html);
    const hasExactTarget = bad.includes(`content="0;url=${canonical}"`);
    const hasDenyDefault = bad.includes("default-src 'none'");
    const hasSafeLink = bad.includes('rel="noopener noreferrer"');
    assert.equal(hasExactTarget && hasDenyDefault && hasSafeLink, false);
  }
});
