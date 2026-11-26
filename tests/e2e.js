// Real-browser click-through. Usage: node tests/e2e.js [baseUrl]   (default: serves this folder locally)
const puppeteer = require('puppeteer-core');
const http = require('http'), fs = require('fs'), path = require('path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.png': 'image/png' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
let passed = 0;
const ok = (name) => { passed++; console.log('  ok -', name); };

(async () => {
  let base = process.argv[2], server;
  if (!base) {
    server = http.createServer((q, s) => {
      let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root) || !fs.existsSync(f)) { s.writeHead(404); return s.end('no'); }
      s.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f));
    }).listen(0);
    base = 'http://127.0.0.1:' + server.address().port + '/';
  }
  const shots = process.env.SHOTS; if (shots) fs.mkdirSync(shots, { recursive: true });
  const shot = async (page, n) => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--lang=en-US'] });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto(base, { waitUntil: 'networkidle0' });

  const txt = sel => page.$eval(sel, e => e.textContent.trim());
  const ty = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.getElementById('reel')).transform).m42);

  // 1. first run seeds a sample, English from navigator.language
  assert.equal(await page.evaluate(() => document.documentElement.dir), 'ltr');
  assert.equal(await page.$$eval('.card', c => c.length), 1);
  ok('first run: English, one sample script'); await shot(page, '01-home-en');

  // 2. language toggle -> Arabic RTL, persisted across reload
  await page.click('#btnLang');
  assert.equal(await page.evaluate(() => document.documentElement.dir), 'rtl');
  assert.equal(await txt('#btnNew'), 'نص جديد');
  await page.reload({ waitUntil: 'networkidle0' });
  assert.equal(await page.evaluate(() => document.documentElement.lang), 'ar');
  ok('Arabic RTL toggle persists after reload'); await shot(page, '02-home-ar');

  // 3. create a new script and type Arabic text
  await page.click('#btnNew');
  await page.waitForSelector('#scriptInput', { visible: true });
  await page.type('#titleInput', 'اختبار');
  await page.type('#scriptInput', 'أهلا بكم في القناة\nهذا سطر ثاني للقراءة\n// ابتسم\n' + 'كلمة '.repeat(120));
  assert.equal(await txt('#stWords'), String(4 + 4 + 120));
  await sleep(500);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qare2.scripts')));
  assert.ok(saved.some(s => s.title === 'اختبار' && s.text.includes('هذا سطر ثاني')));
  ok('editor counts words and saves to localStorage');

  // 4. persistence across reload
  await page.reload({ waitUntil: 'networkidle0' });
  assert.equal(await page.$eval('#titleInput', e => e.value), 'اختبار');
  ok('script survives reload');

  // 5. start prompter: countdown, play, scroll moves
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('qare2.settings')); s.countdown = 1; s.wpm = 320; localStorage.setItem('qare2.settings', JSON.stringify(s)); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('#btnPlay');
  await page.waitForSelector('#reel .ln', { visible: true });
  assert.equal(await page.$eval('#reel .ln', e => e.getAttribute('dir')), 'rtl');
  assert.ok((await page.$$('#reel .ln.cue')).length === 1);
  const y0 = await ty();
  await page.click('#hPlay');
  assert.equal(await page.$eval('#hPlay', e => e.getAttribute('data-state')), 'counting');
  await sleep(1400);
  assert.equal(await page.$eval('#hPlay', e => e.getAttribute('data-state')), 'playing');
  await sleep(1200);
  const y1 = await ty();
  assert.ok(y1 < y0 - 5, 'reel moved up while playing ' + y0 + ' -> ' + y1);
  ok('countdown then auto-scroll'); await shot(page, '03-prompter-playing');

  // 6. pause
  await page.click('#hPlay'); // may be hidden hud; use keyboard fallback
  await sleep(150);
  const st = await page.$eval('#hPlay', e => e.getAttribute('data-state'));
  assert.equal(st, 'paused');
  const yp = await ty(); await sleep(400); assert.equal(await ty(), yp);
  ok('pause stops motion');

  // 7. speed control changes speed
  const measure = async (wpm) => {
    await page.evaluate(w => { document.getElementById('rWpm'); }, wpm);
    await page.click('#hRestart');
    const a = await ty(); await page.keyboard.press('Space'); await sleep(1000); const b = await ty(); await page.keyboard.press('Space');
    return a - b;
  };
  await page.click('#hLook'); await page.waitForSelector('#sheet', { visible: true });
  await page.$eval('#rCount', e => { e.value = 0; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.$eval('#rWpm', e => { e.value = 100; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#sheetClose');
  const slow = await measure();
  await page.click('#hLook'); await page.waitForSelector('#sheet', { visible: true });
  await page.$eval('#rWpm', e => { e.value = 300; e.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.click('#sheetClose');
  const fast = await measure();
  assert.ok(fast > slow * 2, 'fast ' + fast + ' vs slow ' + slow);
  assert.equal(await txt('#hWpm'), '300');
  ok('speed slider: 300 wpm scrolls >2x faster than 100 wpm');

  // 8. +/- buttons for speed and size
  await page.click('#hSlow'); assert.equal(await txt('#hWpm'), '295');
  const fs0 = await page.$eval('#reel', e => parseFloat(getComputedStyle(e).fontSize));
  await page.click('#hBig'); await page.click('#hBig');
  const fs1 = await page.$eval('#reel', e => parseFloat(getComputedStyle(e).fontSize));
  assert.equal(fs1 - fs0, 8);
  await page.click('#hSmall'); assert.equal(await txt('#hSize'), String(fs1 - 4));
  ok('speed and font size buttons');

  // 9. mirror + flip
  await page.click('#hMirror');
  assert.ok(await page.$eval('#stage', e => e.classList.contains('mx')));
  assert.equal(await page.$eval('#stage', e => new DOMMatrix(getComputedStyle(e).transform).a), -1);
  await shot(page, '04-prompter-mirror');
  await page.click('#hMirror');
  await page.click('#hFlip');
  assert.equal(await page.$eval('#stage', e => new DOMMatrix(getComputedStyle(e).transform).d), -1);
  await page.click('#hFlip');
  assert.equal(await page.$eval('#stage', e => new DOMMatrix(getComputedStyle(e).transform).a), 1);
  ok('mirror and vertical flip transform the stage');

  // 10. keyboard: Escape returns to editor, look sheet themes
  await page.click('#hLook');
  await page.click('#segTheme [data-v="amber"]');
  assert.equal(await page.$eval('#view-play', e => e.getAttribute('data-theme')), 'amber');
  await page.click('#segAlign [data-v="center"]');
  assert.ok(await page.$eval('#reel', e => e.classList.contains('center')));
  await page.click('#cCues');
  assert.equal(await page.$eval('#reel .ln.cue', e => getComputedStyle(e).display), 'none');
  await page.click('#cCues');
  assert.notEqual(await page.$eval('#reel .ln.cue', e => getComputedStyle(e).display), 'none');
  await page.click('#segDir [data-v="ltr"]');
  assert.equal(await page.$eval('#reel .ln:not(.gap)', e => e.getAttribute('dir')), 'ltr');
  await page.click('#segDir [data-v="auto"]');
  assert.equal(await page.$eval('#reel .ln:not(.gap)', e => e.getAttribute('dir')), 'rtl');
  await page.click('#cGuide'); assert.ok(await page.$eval('#view-play', e => e.classList.contains('no-guide'))); await page.click('#cGuide');
  await shot(page, '05-look-sheet');
  await page.click('#sheetClose');
  await page.keyboard.press('Escape');
  await page.waitForSelector('#scriptInput', { visible: true });
  ok('theme and alignment apply; Escape leaves the prompter');

  // 11. delete needs two taps, duplicate works
  await page.click('#btnDup');
  await page.waitForFunction(() => document.getElementById('titleInput').value.startsWith('نسخة'));
  assert.equal(await page.$eval('#titleInput', e => e.value), 'Copy of اختبار'.replace('Copy of', 'نسخة من'));
  await page.click('#btnDelete'); assert.ok(await page.$eval('#btnDelete', e => e.classList.contains('armed')));
  await page.click('#btnDelete');
  await page.waitForSelector('#cards .card');
  assert.equal(await page.$$eval('.card', c => c.length), 2);
  ok('duplicate, then delete needs a second tap');

  // 12. English mode, sample plays through to the end card
  await page.click('#btnLang');
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('qare2.settings')); s.countdown = 0; s.wpm = 320; localStorage.setItem('qare2.settings', JSON.stringify(s)); });
  await page.reload({ waitUntil: 'networkidle0' });
  await page.click('#cards .card:last-child [data-play]');
  await page.waitForSelector('#reel .ln', { visible: true });
  assert.equal(await page.$eval('#reel .ln:not(.cue)', e => e.getAttribute('dir')), 'ltr');
  await shot(page, '06-prompter-en');
  await page.keyboard.press('Space');
  await page.waitForSelector('#endCard:not([hidden])', { visible: true, timeout: 60000 });
  assert.equal(await page.$eval('#progressFill', e => e.style.width), '100%');
  ok('plays to the end and shows the end card');

  // 13. restart from end card
  await page.click('#btnAgain'); await sleep(300);
  assert.equal(await page.$eval('#endCard', e => e.hidden), true);
  await page.mouse.click(200, 300); await page.click('#hExit'); await page.waitForSelector('#btnBack', { visible: true }); await page.click('#btnBack'); await page.waitForSelector('#view-home:not([hidden])'); await sleep(200);

  // 14. touch drag scrolls the text
  await page.click('#cards .card:last-child [data-play]');
  await page.waitForSelector('#reel .ln', { visible: true });
  const d0 = await ty();
  await page.touchscreen.touchStart(200, 600); await page.touchscreen.touchMove(200, 400); await page.touchscreen.touchEnd();
  await sleep(100);
  const d1 = await ty();
  assert.ok(d1 < d0 - 100, 'finger drag up moves text up: ' + d0 + ' -> ' + d1);
  ok('touch drag scrolls the text');
  await page.mouse.move(200, 400); await page.mouse.wheel({ deltaY: 120 }); await sleep(100);
  assert.ok(await ty() < d1 - 50, 'wheel scrolls');
  ok('mouse wheel scrolls the text');

  // 15. backup export/import validation
  await page.click('#hExit'); await page.click('#btnBack'); await page.waitForSelector('#btnExportAll', { visible: true });
  const bad = '/tmp/bad.json'; fs.writeFileSync(bad, '{"x":1}');
  const inp = await page.$('#fileBackup'); await inp.uploadFile(bad);
  await page.waitForFunction(() => { const t = document.getElementById('toast'); return !t.hidden && t.textContent.length > 3; });
  assert.equal(await txt('#toast'), 'That file is not valid');
  const good = '/tmp/good.json';
  fs.writeFileSync(good, JSON.stringify({ app: 'qare2', scripts: [{ id: 'zz1', title: 'Imported one', text: 'Hello from backup' }], settings: { wpm: 150 } }));
  await (await page.$('#fileBackup')).uploadFile(good);
  await page.waitForFunction(() => document.body.textContent.includes('Imported one'));
  ok('backup restore: rejects bad file, imports good one');

  // 16. txt import
  const t1 = '/tmp/my-notes.txt'; fs.writeFileSync(t1, 'Line one of my notes\nLine two');
  await (await page.$('#fileTxt')).uploadFile(t1);
  await page.waitForSelector('#scriptInput', { visible: true });
  assert.equal(await page.$eval('#titleInput', e => e.value), 'my-notes');
  ok('txt import creates a script');

  // 16b. installable + works offline
  await page.evaluate(() => navigator.serviceWorker.ready);
  assert.equal(await page.$eval('link[rel=manifest]', e => e.getAttribute('href')), 'manifest.webmanifest');
  await sleep(500);
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#btnNew');
  assert.ok(await page.$$eval('.card', c => c.length) >= 1);
  await page.setOfflineMode(false);
  ok('service worker: app reloads offline with data intact');

  // 16c. no horizontal overflow on a 320px phone, both languages
  await page.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
  for (const lang of ['ar', 'en']) {
    await page.evaluate(l => { const s = JSON.parse(localStorage.getItem('qare2.settings')); s.lang = l; localStorage.setItem('qare2.settings', JSON.stringify(s)); }, lang);
    await page.goto(base, { waitUntil: 'networkidle0' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'home overflow ' + lang);
    await page.click('#cards .card [data-open]'); await page.waitForSelector('#scriptInput', { visible: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'editor overflow ' + lang);
    await page.click('#btnPlay'); await page.waitForSelector('#reel .ln', { visible: true });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'prompter overflow ' + lang);
    await page.goto(base + '#/', { waitUntil: 'networkidle0' });
  }
  ok('no horizontal overflow at 320px in Arabic and English');

  // 17. desktop layout screenshot
  await page.setViewport({ width: 1280, height: 800 });
  await sleep(200); await shot(page, '07-home-desktop');
  assert.deepEqual(errors, [], 'no console errors: ' + errors.join(' | '));
  ok('no console or page errors');

  await browser.close(); if (server) server.close();
  console.log('\n' + passed + ' e2e checks passed');
})().catch(e => { console.error('E2E FAILED:', e); process.exit(1); });
