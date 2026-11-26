// Generates the README screenshots from clean sample data. Usage: node tests/screenshots.js
const puppeteer = require('puppeteer-core'), http = require('http'), fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), out = path.join(root, 'docs');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.png': 'image/png', '.webmanifest': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const AR = { id: 'demo-ar', title: 'مقدمة قناة', updated: 3, text: '// ابتسم وانظر في العدسة\nأهلا بيكم في قناتي، أنا يوسف.\nفي الفيديو ده هوريكم إزاي تصوروا من غير ما تحفظوا النص.\n\n---\n\n// خذ نفس هنا\nأول حاجة: اكتب الفكرة في ثلاث نقاط بس.\nتاني حاجة: اقرأ بصوت طبيعي كأنك بتكلم صاحبك.\nتالت حاجة: خلي الكاميرا في مستوى عينك.\n\n[وقفة قصيرة]\n\nلو الفيديو عجبك، اشترك وشاركه مع حد محتاجه.\nنشوفكم في الفيديو الجاي.' };
const EN = { id: 'demo-en', title: 'Product review opener', updated: 2, text: '// Look at the lens, smile\nHi everyone, welcome back to the channel.\nToday I am reviewing a small desk lamp I have used for a month.\n\n---\n\nThree things I liked.\nIt is bright without being harsh.\nThe arm holds its position.\nThe price is fair.\n\n[pause]\n\nHere is what I did not like.' };
const TALK = { id: 'demo-3', title: 'Weekly update', updated: 1, text: 'Quick update for the team.\nShipped the new onboarding.\nNext week: pricing page.' };
(async () => {
  fs.mkdirSync(out, { recursive: true });
  const server = http.createServer((q, s) => { let p = q.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html'; const f = path.join(root, p); if (!fs.existsSync(f)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': mime[path.extname(f)] || 'x' }); s.end(fs.readFileSync(f)); }).listen(0);
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox'] });
  async function open(lang, vp, settings) {
    const page = await browser.newPage();
    await page.setViewport(vp);
    await page.goto(base, { waitUntil: 'networkidle0' });
    await page.evaluate((scripts, st) => { localStorage.setItem('qare2.scripts', JSON.stringify(scripts)); localStorage.setItem('qare2.settings', JSON.stringify(st)); }, [AR, EN, TALK], Object.assign({ lang, countdown: 0, wpm: 120 }, settings || {}));
    await page.goto(base, { waitUntil: 'networkidle0' });
    return page;
  }
  const phone = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
  let p = await open('ar', phone);
  await p.screenshot({ path: out + '/home-ar.png' });
  await p.click('[data-open="demo-ar"]'); await p.waitForSelector('#scriptInput', { visible: true }); await sleep(300);
  await p.screenshot({ path: out + '/editor-ar.png' });
  await p.click('#btnPlay'); await p.waitForSelector('#reel .ln', { visible: true }); await sleep(400);
  await p.mouse.move(200, 400); await p.mouse.wheel({ deltaY: 330 }); await sleep(400);
  await p.screenshot({ path: out + '/prompter-ar.png' });
  await p.close();

  p = await open('en', phone, { theme: 'amber', mirrorX: true });
  await p.click('[data-play="demo-en"]'); await p.waitForSelector('#reel .ln', { visible: true }); await sleep(400);
  await p.mouse.move(200, 400); await p.mouse.wheel({ deltaY: 260 }); await sleep(400);
  await p.screenshot({ path: out + '/prompter-mirror-en.png' });
  await p.close();

  p = await open('en', phone, { theme: 'paper' });
  await p.click('#btnLook'); await sleep(400);
  await p.screenshot({ path: out + '/look-en.png' });
  await p.close();

  p = await open('en', { width: 1280, height: 800, deviceScaleFactor: 1 });
  await p.screenshot({ path: out + '/home-desktop.png' });
  await p.close();
  await browser.close(); server.close();
  console.log('screenshots written to docs/');
})();
