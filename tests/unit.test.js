const test = require('node:test');
const assert = require('node:assert/strict');
const Q = require('../lib.js');

test('detectDir picks the first strong letter', () => {
  assert.equal(Q.detectDir('مرحبا بكم'), 'rtl');
  assert.equal(Q.detectDir('Hello world'), 'ltr');
  assert.equal(Q.detectDir('123 مرحبا'), 'rtl');
  assert.equal(Q.detectDir('...'), 'ltr');
});

test('parseScript: lines, cues, breaks, gaps', () => {
  const b = Q.parseScript('// smile\nHello there\n\n\n---\n[pause]\nأهلا\n\n');
  assert.deepEqual(b.map(x => x.type), ['cue', 'line', 'gap', 'break', 'cue', 'line']);
  assert.equal(b[0].text, 'smile');
  assert.equal(b[4].text, 'pause');
  assert.equal(b[5].dir, 'rtl');
});

test('parseScript handles CRLF and empty input', () => {
  assert.equal(Q.parseScript('a\r\nb').length, 2);
  assert.deepEqual(Q.parseScript(''), []);
  assert.deepEqual(Q.parseScript(null), []);
});

test('countWords ignores cues and counts Arabic', () => {
  assert.equal(Q.countWords('// note here\none two three\n[x y]\nأهلا بكم في القناة'), 7);
  assert.equal(Q.countWords('   '), 0);
});

test('estimateSeconds and formatTime', () => {
  assert.equal(Q.estimateSeconds(130, 130), 60);
  assert.equal(Q.estimateSeconds(0, 130), 0);
  assert.equal(Q.formatTime(65), '1:05');
  assert.equal(Q.formatTime(-4), '0:00');
});

test('pxPerSecond scales with wpm', () => {
  const slow = Q.pxPerSecond(100, 6000, 300), fast = Q.pxPerSecond(200, 6000, 300);
  assert.ok(Math.abs(fast / slow - 2) < 1e-9);
  assert.equal(Q.pxPerSecond(100, 6000, 0), 0);
});

test('time to read whole text at wpm matches estimate', () => {
  const words = 260, wpm = 130, max = 5200;
  const px = Q.pxPerSecond(wpm, max, words);
  assert.equal(Math.round(max / px), Q.estimateSeconds(words, wpm));
  assert.equal(Q.remainingSeconds(0, max, wpm, words), 120);
  assert.equal(Q.remainingSeconds(max, max, wpm, words), 0);
  assert.equal(Q.remainingSeconds(max / 2, max, wpm, words), 60);
});

test('sanitizeSettings clamps and rejects junk', () => {
  const s = Q.sanitizeSettings({ wpm: 9999, size: 1, lang: 'fr', theme: 'neon', mirrorX: 1, margin: -3, dir: 'rtl' });
  assert.equal(s.wpm, 320); assert.equal(s.size, 20); assert.equal(s.lang, 'ar');
  assert.equal(s.theme, 'ink'); assert.equal(s.mirrorX, true); assert.equal(s.margin, 0); assert.equal(s.dir, 'rtl');
  assert.deepEqual(Q.sanitizeSettings('x'), Q.DEFAULTS);
});

test('backup round trip and rejection of bad files', () => {
  const json = Q.makeBackup([{ id: 'a', title: 'T', text: 'hello', updated: 5 }], { wpm: 100 });
  const back = Q.parseBackup(json);
  assert.equal(back.scripts.length, 1); assert.equal(back.scripts[0].text, 'hello'); assert.equal(back.settings.wpm, 100);
  assert.equal(Q.parseBackup('not json'), null);
  assert.equal(Q.parseBackup('{"app":"other","scripts":[]}'), null);
  const mixed = Q.parseBackup(JSON.stringify({ app: 'qare2', scripts: [{ text: 5 }, { text: 'ok' }] }));
  assert.equal(mixed.scripts.length, 1); assert.ok(mixed.scripts[0].id);
});

test('deriveTitle uses first spoken line', () => {
  assert.equal(Q.deriveTitle('// c\nFirst line here'), 'First line here');
  assert.equal(Q.deriveTitle(''), '');
});
