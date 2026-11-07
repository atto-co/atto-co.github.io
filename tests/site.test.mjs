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
