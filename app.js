(function () {
  'use strict';
  var Q = window.Qare;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- i18n ---------- */
  var T = {
    ar: {
      eyebrow: 'تيليبرومبتر مجاني للمبدعين', heroTitle: 'اقرأ نصك وأنت تنظر في الكاميرا.',
      heroLede: 'الصق النص، اضبط السرعة وحجم الخط، واقلب الشاشة لو بتصور بمرآة. كل حاجة بتتحفظ على جهازك فقط.',
      newScript: 'نص جديد', importTxt: 'استيراد ملف نصي', myScripts: 'نصوصي', empty: 'لا توجد نصوص بعد. اضغط «نص جديد» وابدأ.',
      exportAll: 'نسخة احتياطية', importBackup: 'استعادة نسخة', back: 'كل النصوص', title: 'العنوان', scriptLabel: 'النص',
      words: 'كلمة', duration: 'المدة المتوقعة', lines: 'سطر', syntaxTitle: 'ملاحظات داخل النص',
      syntaxCue: 'سطر ملاحظة يظهر باللون الأصفر ولا يُحسب في المدة', syntaxBracket: 'سطر بين أقواس يعتبر ملاحظة أيضا', syntaxBreak: 'فاصل بين الأقسام',
      startPrompter: 'ابدأ القراءة', duplicate: 'نسخ', exportTxt: 'تصدير txt', delete: 'حذف', deleteSure: 'اضغط مرة ثانية للحذف',
      look: 'المظهر', lookTitle: 'مظهر القارئ', done: 'تم', speed: 'السرعة (كلمة بالدقيقة)', fontSize: 'حجم الخط', lineHeight: 'تباعد الأسطر', margin: 'الهوامش',
      countdown: 'عد تنازلي (ثانية)', theme: 'الألوان', thInk: 'ليلي', thPaper: 'ورقي', thAmber: 'كهرماني', thGreen: 'أخضر',
      font: 'الخط', fPlex: 'عصري', fSerif: 'نسخ', fMono: 'ثابت', direction: 'اتجاه النص', dAuto: 'تلقائي', dRtl: 'يمين', dLtr: 'يسار',
      align: 'المحاذاة', aStart: 'بداية السطر', aCenter: 'وسط', mirrorTitle: 'خيارات', mirror: 'مرآة', flip: 'قلب رأسي', guideLine: 'خط القراءة', showCues: 'إظهار الملاحظات',
      resetLook: 'استعادة الإعدادات الافتراضية', wpm: 'ك/د', px: 'بكسل', restart: 'من البداية', finished: 'انتهى النص', again: 'مرة تانية',
      saved: 'تم الحفظ', saving: '...', untitled: 'بدون عنوان', scriptsN: function (n) { return n + ' نص'; },
      min: 'د', copyOf: 'نسخة من ', imported: 'تم الاستيراد', badFile: 'الملف غير صالح', deleted: 'تم الحذف', duplicated: 'تم النسخ', exported: 'تم التصدير',
      read: 'قراءة', sampleHint: 'هذا نص تجريبي، عدّله كما تريد.', noScript: 'النص غير موجود', resetDone: 'تمت الاستعادة', long: 'النص طويل جدا للمعاينة'
    },
    en: {
      eyebrow: 'A free teleprompter for creators', heroTitle: 'Read your script while you look at the lens.',
      heroLede: 'Paste your script, set the speed and text size, and flip it for a mirror rig. Everything stays on your device.',
      newScript: 'New script', importTxt: 'Import a .txt file', myScripts: 'My scripts', empty: 'No scripts yet. Tap "New script" to start.',
      exportAll: 'Back up everything', importBackup: 'Restore a backup', back: 'All scripts', title: 'Title', scriptLabel: 'Script',
      words: 'words', duration: 'est. time', lines: 'lines', syntaxTitle: 'Notes inside your script',
      syntaxCue: 'a note line shows in amber and is not counted in the time', syntaxBracket: 'a line in brackets is a note too', syntaxBreak: 'a divider between sections',
      startPrompter: 'Start prompter', duplicate: 'Duplicate', exportTxt: 'Export txt', delete: 'Delete', deleteSure: 'Tap again to delete',
      look: 'Look', lookTitle: 'Prompter look', done: 'Done', speed: 'Speed (words per minute)', fontSize: 'Text size', lineHeight: 'Line spacing', margin: 'Side margins',
      countdown: 'Countdown (seconds)', theme: 'Colors', thInk: 'Night', thPaper: 'Paper', thAmber: 'Amber', thGreen: 'Green',
      font: 'Font', fPlex: 'Modern', fSerif: 'Serif', fMono: 'Mono', direction: 'Text direction', dAuto: 'Auto', dRtl: 'RTL', dLtr: 'LTR',
      align: 'Alignment', aStart: 'Start', aCenter: 'Center', mirrorTitle: 'Options', mirror: 'Mirror', flip: 'Flip vertical', guideLine: 'Reading line', showCues: 'Show notes',
      resetLook: 'Reset to defaults', wpm: 'wpm', px: 'px', restart: 'Restart', finished: 'End of script', again: 'Again',
      saved: 'Saved', saving: '...', untitled: 'Untitled', scriptsN: function (n) { return n + (n === 1 ? ' script' : ' scripts'); },
      min: 'min', copyOf: 'Copy of ', imported: 'Imported', badFile: 'That file is not valid', deleted: 'Deleted', duplicated: 'Duplicated', exported: 'Exported',
      read: 'Read', sampleHint: 'This is a sample script. Edit it as you like.', noScript: 'Script not found', resetDone: 'Reset', long: 'Script is long'
    }
  };

  var SAMPLES = {
    ar: {
      title: 'مقدمة قناة',
      text: '// ابتسم وانظر في العدسة\nأهلا بيكم في قناتي، أنا يوسف.\nفي الفيديو ده هوريكم إزاي تصوروا من غير ما تحفظوا النص.\n\n---\n\n// خذ نفس هنا\nأول حاجة: اكتب الفكرة في ثلاث نقاط بس.\nتاني حاجة: اقرأ بصوت طبيعي كأنك بتكلم صاحبك.\nتالت حاجة: خلي الكاميرا في مستوى عينك.\n\n[وقفة قصيرة]\n\nلو الفيديو عجبك، اشترك وشاركه مع حد محتاجه.\nنشوفكم في الفيديو الجاي.'
    },
    en: {
      title: 'Channel intro',
      text: '// Smile and look at the lens\nHi everyone, welcome back to the channel.\nToday I will show you how to record a video without memorising your script.\n\n---\n\n// Take a breath here\nFirst, write your idea as three short points.\nSecond, read it the way you would talk to a friend.\nThird, keep the camera at eye level.\n\n[short pause]\n\nIf this helped, subscribe and share it with someone who needs it.\nSee you in the next one.'
    }
  };

  /* ---------- storage ---------- */
  var KS = 'qare2.scripts', KT = 'qare2.settings';
  var memStore = {};
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return memStore[k] || null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { memStore[k] = v; } }

  var scripts = [];
  var settings = Q.sanitizeSettings(null);

  function load() {
    var rawS = lsGet(KT);
    if (rawS) { try { settings = Q.sanitizeSettings(JSON.parse(rawS)); } catch (e) {} }
    else { settings.lang = /^ar/i.test(navigator.language || '') ? 'ar' : 'en'; }
    var raw = lsGet(KS);
    if (raw === null) {
      scripts = [seedFor(settings.lang)];
      saveScripts();
    } else {
      try { var a = JSON.parse(raw); scripts = Array.isArray(a) ? a.filter(function (s) { return s && typeof s.text === 'string'; }) : []; } catch (e) { scripts = []; }
    }
  }
  function seedFor(lang) { var s = SAMPLES[lang]; return { id: Q.newId(), title: s.title, text: s.text, updated: Date.now() }; }
  function saveScripts() { lsSet(KS, JSON.stringify(scripts)); }
  function saveSettings() { lsSet(KT, JSON.stringify(settings)); }
  function byId(id) { for (var i = 0; i < scripts.length; i++) if (scripts[i].id === id) return scripts[i]; return null; }
  function t(k) { return T[settings.lang][k]; }

  /* ---------- helpers ---------- */
  var toastTimer;
  function toast(msg) {
    var el = $('toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 2200);
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function minutesLabel(sec) { return sec < 60 ? sec + ' ' + (settings.lang === 'ar' ? 'ث' : 's') : Q.formatTime(sec); }

  function applyLang() {
    var l = settings.lang;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    $('btnLang').textContent = l === 'ar' ? 'EN' : 'عر';
    $('btnLang').setAttribute('aria-label', l === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
    document.title = l === 'ar' ? 'Qare2 | قارئ' : 'Qare2 | Teleprompter';
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) { var v = T[l][nodes[i].getAttribute('data-i18n')]; if (typeof v === 'string') nodes[i].textContent = v; }
    $('hExit').setAttribute('aria-label', l === 'ar' ? 'خروج' : 'Exit');
    $('hFull').setAttribute('aria-label', l === 'ar' ? 'ملء الشاشة' : 'Fullscreen');
    $('hSlow').setAttribute('aria-label', l === 'ar' ? 'أبطأ' : 'Slower');
    $('hFast').setAttribute('aria-label', l === 'ar' ? 'أسرع' : 'Faster');
    $('hSmall').setAttribute('aria-label', l === 'ar' ? 'خط أصغر' : 'Smaller text');
    $('hBig').setAttribute('aria-label', l === 'ar' ? 'خط أكبر' : 'Bigger text');
    updatePlayBtn();
    $('previewText').textContent = l === 'ar' ? 'هذا شكل النص أثناء القراءة' : 'This is how your text will look';
    $('previewText').setAttribute('dir', l === 'ar' ? 'rtl' : 'ltr');
    renderHome();
    if (route.name === 'edit') { updateStats(); $('savedState').textContent = t('saved'); }
  }

  /* ---------- router ---------- */
  var route = { name: 'home', id: null };
  function parseHash() {
    var h = location.hash.replace(/^#\/?/, '').split('/');
    if (h[0] === 'edit' && h[1]) return { name: 'edit', id: h[1] };
    if (h[0] === 'play' && h[1]) return { name: 'play', id: h[1] };
    return { name: 'home', id: null };
  }
  function go(hash) { if (location.hash === hash) onRoute(); else location.hash = hash; }
  function onRoute() {
    var prev = route.name;
    if (prev === 'play') stopPlayer();
    var r = parseHash();
    if ((r.name === 'edit' || r.name === 'play') && !byId(r.id)) { r = { name: 'home', id: null }; if (location.hash !== '#/') history.replaceState(null, '', '#/'); }
    route = r;
    document.body.setAttribute('data-view', r.name === 'play' ? 'play' : r.name);
    $('view-home').hidden = r.name !== 'home';
    $('view-edit').hidden = r.name !== 'edit';
    $('view-play').hidden = r.name !== 'play';
    closeSheet();
    if (r.name === 'home') { renderHome(); window.scrollTo(0, 0); document.title = settings.lang === 'ar' ? 'Qare2 | قارئ' : 'Qare2 | Teleprompter'; }
    if (r.name === 'edit') openEditor(r.id);
    if (r.name === 'play') openPlayer(r.id);
  }

  /* ---------- home ---------- */
  var playIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>';
  var pauseIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="4" width="5" height="16" rx="1.5"/><rect x="14" y="4" width="5" height="16" rx="1.5"/></svg>';

  function renderHome() {
    var ul = $('cards'); ul.textContent = '';
    var sorted = scripts.slice().sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
    sorted.forEach(function (s) {
      var li = el('li', 'card');
      var main = el('button', 'card-main'); main.type = 'button';
      main.setAttribute('data-open', s.id);
      var title = s.title || Q.deriveTitle(s.text) || t('untitled');
      var ttl = el('div', 'card-title', title); ttl.setAttribute('dir', 'auto');
      var firstLine = ''; var bl = Q.parseScript(s.text); for (var i = 0; i < bl.length; i++) if (bl[i].type === 'line') { firstLine = bl[i].text; break; }
      var sn = el('div', 'card-snippet', firstLine); sn.setAttribute('dir', 'auto');
      var words = Q.countWords(s.text);
      var meta = el('div', 'card-meta');
      meta.appendChild(el('span', '', words + ' ' + t('words')));
      meta.appendChild(el('span', '', '~' + minutesLabel(Q.estimateSeconds(words, settings.wpm))));
      main.appendChild(ttl); main.appendChild(sn); main.appendChild(meta);
      var goBtn = el('button', 'card-go'); goBtn.type = 'button'; goBtn.setAttribute('data-play', s.id);
      goBtn.setAttribute('aria-label', t('read') + ': ' + title);
      goBtn.innerHTML = playIcon; goBtn.appendChild(el('span', '', t('read')));
      li.appendChild(main); li.appendChild(goBtn); ul.appendChild(li);
    });
    $('emptyNote').hidden = scripts.length > 0;
    $('scriptCount').textContent = t('scriptsN')(scripts.length);
  }

  function newScript(title, text) {
    var s = { id: Q.newId(), title: title || '', text: text || '', updated: Date.now() };
    scripts.push(s); saveScripts(); return s;
  }

  /* ---------- editor ---------- */
  var cur = null, saveTimer;
  function openEditor(id) {
    cur = byId(id);
    $('titleInput').value = cur.title || '';
    $('scriptInput').value = cur.text;
    $('titleInput').placeholder = t('untitled');
    $('savedState').textContent = t('saved');
    resetDelete(); updateStats();
    window.scrollTo(0, 0);
    document.title = (cur.title || t('untitled')) + ' | Qare2';
  }
  function updateStats() {
    if (!cur) return;
    var txt = $('scriptInput').value;
    var w = Q.countWords(txt);
    $('stWords').textContent = w;
    $('stTime').textContent = Q.formatTime(Q.estimateSeconds(w, settings.wpm));
    var n = 0, b = Q.parseScript(txt); b.forEach(function (x) { if (x.type === 'line') n++; });
    $('stLines').textContent = n;
  }
  function queueSave() {
    $('savedState').textContent = t('saving');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, 250);
  }
  function flushSave() {
    clearTimeout(saveTimer);
    if (!cur) return;
    cur.title = $('titleInput').value.trim();
    cur.text = $('scriptInput').value;
    cur.updated = Date.now();
    saveScripts();
    $('savedState').textContent = t('saved');
  }
  var delTimer;
  function resetDelete() { var b = $('btnDelete'); b.classList.remove('armed'); b.textContent = t('delete'); clearTimeout(delTimer); }
  function download(name, text, type) {
    var blob = new Blob([text], { type: type + ';charset=utf-8' });
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function safeName(s) { return (s || 'script').replace(/[\\/:*?"<>|\n\r]+/g, ' ').trim().slice(0, 60) || 'script'; }

  /* ---------- prompter ---------- */
  var P = { words: 0, lines: [], tops: [], pos: 0, max: 0, gy: 0, playing: false, started: false, raf: 0, last: 0, elapsed: 0, active: -1, hudTimer: 0, counting: false, countTimer: 0, wake: null, drag: null, ended: false };
  var reel, stage, view;

  function updatePlayBtn() {
    var b = $('hPlay'); if (!b) return;
    b.innerHTML = P.playing || P.counting ? pauseIcon : playIcon;
    var ar = settings.lang === 'ar';
    b.setAttribute('aria-label', P.playing || P.counting ? (ar ? 'إيقاف مؤقت' : 'Pause') : (ar ? 'تشغيل' : 'Play'));
    b.setAttribute('data-state', P.playing ? 'playing' : (P.counting ? 'counting' : 'paused'));
  }

  function renderReel() {
    reel.textContent = '';
    var blocks = Q.parseScript(cur.text);
    P.lines = [];
    blocks.forEach(function (b) {
      var p = el('p', 'ln ' + (b.type === 'cue' ? 'cue' : b.type === 'gap' ? 'gap' : b.type === 'break' ? 'brk' : 'line'));
      if (b.type === 'line' || b.type === 'cue') {
        p.textContent = b.text;
        p.setAttribute('dir', settings.dir === 'auto' ? b.dir : settings.dir);
        if (b.type === 'cue' && !settings.cues) p.style.display = 'none';
      }
      reel.appendChild(p); P.lines.push(p);
    });
    P.words = Q.countWords(cur.text);
  }

  function applyLook() {
    view.setAttribute('data-theme', settings.theme);
    $('preview').setAttribute('data-theme', settings.theme);
    reel.className = 'reel f-' + settings.font + (settings.align === 'center' ? ' center' : '');
    reel.style.fontSize = settings.size + 'px';
    reel.style.lineHeight = settings.lineHeight;
    reel.style.setProperty('--mpad', settings.margin + '%');
    stage.className = 'stage' + (settings.mirrorX ? ' mx' : '') + (settings.mirrorY ? ' my' : '');
    view.classList.toggle('no-guide', !settings.guide);
    $('hMirror').setAttribute('aria-pressed', String(settings.mirrorX));
    $('hFlip').setAttribute('aria-pressed', String(settings.mirrorY));
    $('hWpm').textContent = settings.wpm;
    $('hSize').textContent = settings.size;
    for (var i = 0; i < P.lines.length; i++) if (P.lines[i].classList.contains('cue')) P.lines[i].style.display = settings.cues ? '' : 'none';
  }

  function layout() {
    if (route.name !== 'play') return;
    var frac = P.max > 0 ? P.pos / P.max : 0;
    var h = stage.clientHeight;
    P.gy = Math.round(h * 0.38);
    reel.style.paddingTop = P.gy + 'px';
    reel.style.paddingBottom = Math.round(h * 0.62) + 'px';
    P.max = Math.max(0, reel.scrollHeight - h);
    P.tops = P.lines.map(function (p) { return { t: p.offsetTop, h: p.offsetHeight, vis: p.offsetHeight > 0 }; });
    P.pos = Q.clamp(frac * P.max, 0, P.max);
    P.active = -1;
    render();
  }

  function render() {
    reel.style.transform = 'translate3d(0,' + (-P.pos).toFixed(2) + 'px,0)';
    var y = P.pos + P.gy, idx = -1;
    for (var i = 0; i < P.tops.length; i++) {
      if (!P.tops[i].vis) continue;
      if (P.tops[i].t <= y) idx = i; else break;
    }
    if (idx !== P.active) {
      P.active = idx;
      for (var j = 0; j < P.lines.length; j++) {
        var c = P.lines[j].classList;
        c.toggle('on', j === idx); c.toggle('done', j < idx);
      }
    }
    $('progressFill').style.width = (P.max ? (P.pos / P.max) * 100 : 0).toFixed(2) + '%';
    $('hLeft').textContent = Q.formatTime(Q.remainingSeconds(P.pos, P.max, settings.wpm, P.words));
    $('hElapsed').textContent = Q.formatTime(P.elapsed);
  }

  function frame(now) {
    if (!P.playing) return;
    var dt = Math.min(0.1, (now - P.last) / 1000); P.last = now;
    P.elapsed += dt;
    P.pos += Q.pxPerSecond(settings.wpm, P.max, P.words) * dt;
    if (P.pos >= P.max) { P.pos = P.max; render(); finish(); return; }
    render();
    P.raf = requestAnimationFrame(frame);
  }

  function startMotion() {
    if (P.playing) return;
    P.ended = false; $('endCard').hidden = true;
    if (P.max - P.pos < 1) { P.pos = 0; }
    P.playing = true; P.started = true; P.last = performance.now();
    P.raf = requestAnimationFrame(frame);
    updatePlayBtn(); hudSoon(); requestWake();
  }
  function pauseMotion() {
    P.playing = false; cancelAnimationFrame(P.raf);
    cancelCount(); updatePlayBtn(); showHud(true); releaseWake();
  }
  function finish() {
    P.playing = false; P.ended = true; updatePlayBtn(); showHud(true); releaseWake();
    $('endCard').hidden = false;
  }
  function toggle() {
    if (P.counting) { cancelCount(); return; }
    if (P.playing) { pauseMotion(); return; }
    if (settings.countdown > 0 && P.pos < 2 && !P.started) { startCount(settings.countdown); return; }
    startMotion();
  }
  function startCount(n) {
    P.counting = true; P.started = true; updatePlayBtn();
    var o = $('countOverlay'); o.hidden = false; o.textContent = n;
    showHud(false); hudSoon();
    P.countTimer = setTimeout(function step() {
      n--;
      if (!P.counting) return;
      if (n <= 0) { o.hidden = true; P.counting = false; startMotion(); return; }
      o.textContent = n; P.countTimer = setTimeout(step, 1000);
    }, 1000);
  }
  function cancelCount() { clearTimeout(P.countTimer); P.counting = false; $('countOverlay').hidden = true; }
  function restart() {
    var was = P.playing;
    cancelCount(); P.pos = 0; P.elapsed = 0; P.started = false; P.ended = false; $('endCard').hidden = true; render();
    if (was) { P.playing = false; cancelAnimationFrame(P.raf); startMotion(); }
  }
  function nudge(px) {
    P.pos = Q.clamp(P.pos + px, 0, P.max); P.ended = false; $('endCard').hidden = true; render();
  }

  function showHud(keep) { $('hud').classList.remove('hide'); clearTimeout(P.hudTimer); if (!keep) hudSoon(); }
  function hudSoon() {
    clearTimeout(P.hudTimer);
    P.hudTimer = setTimeout(function () { if ((P.playing || P.counting) && $('sheet').hidden) $('hud').classList.add('hide'); }, 2600);
  }
  function requestWake() { try { if (navigator.wakeLock && !P.wake) navigator.wakeLock.request('screen').then(function (w) { P.wake = w; w.addEventListener('release', function () { P.wake = null; }); }).catch(function () {}); } catch (e) {} }
  function releaseWake() { try { if (P.wake) { P.wake.release(); P.wake = null; } } catch (e) {} }

  function openPlayer(id) {
    cur = byId(id);
    P.pos = 0; P.elapsed = 0; P.started = false; P.playing = false; P.ended = false; P.max = 0;
    $('endCard').hidden = true; $('countOverlay').hidden = true;
    renderReel(); applyLook();
    document.title = (cur.title || t('untitled')) + ' | Qare2';
    $('hud').classList.remove('hide');
    updatePlayBtn();
    layout();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  }
  function stopPlayer() {
    P.playing = false; cancelAnimationFrame(P.raf); cancelCount(); releaseWake(); clearTimeout(P.hudTimer);
    try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  }

  function setWpm(v) { settings.wpm = Q.clamp(Math.round(v), 40, 320); saveSettings(); $('hWpm').textContent = settings.wpm; syncSheet(); render(); }
  function setSize(v) { settings.size = Q.clamp(Math.round(v), 20, 140); saveSettings(); applyLook(); layout(); syncSheet(); }

  /* ---------- sheet ---------- */
  var sheetOpener = null;
  function openSheet() {
    sheetOpener = document.activeElement;
    syncSheet(); $('sheet').hidden = false; $('sheetBack').hidden = false;
    $('hud').classList.remove('hide'); clearTimeout(P.hudTimer);
    $('sheetClose').focus();
  }
  function closeSheet() {
    if ($('sheet').hidden) return;
    $('sheet').hidden = true; $('sheetBack').hidden = true;
    if (sheetOpener && sheetOpener.focus) try { sheetOpener.focus(); } catch (e) {}
    if (route.name === 'play') hudSoon();
  }
  function setSeg(id, val) {
    var bs = $(id).querySelectorAll('button');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-v') === val));
  }
  function syncSheet() {
    $('rWpm').value = settings.wpm; $('oWpm').textContent = settings.wpm;
    $('rSize').value = settings.size; $('oSize').textContent = settings.size;
    $('rLh').value = settings.lineHeight; $('oLh').textContent = (+settings.lineHeight).toFixed(2);
    $('rMargin').value = settings.margin; $('oMargin').textContent = settings.margin + '%';
    $('rCount').value = settings.countdown; $('oCount').textContent = settings.countdown;
    setSeg('segTheme', settings.theme); setSeg('segFont', settings.font); setSeg('segDir', settings.dir); setSeg('segAlign', settings.align);
    $('cMirror').checked = settings.mirrorX; $('cFlip').checked = settings.mirrorY; $('cGuide').checked = settings.guide; $('cCues').checked = settings.cues;
    var pv = $('preview'); pv.setAttribute('data-theme', settings.theme);
    var p = $('previewText'); p.style.fontSize = Math.min(settings.size, 48) + 'px'; p.style.lineHeight = settings.lineHeight;
    p.style.fontWeight = settings.font === 'serif' ? 700 : 600;
    p.style.fontFamily = settings.font === 'serif' ? '"Noto Naskh Arabic","Amiri",Georgia,serif' : settings.font === 'mono' ? 'ui-monospace,Menlo,Consolas,monospace' : '"Plex",system-ui,sans-serif';
    p.style.textAlign = settings.align === 'center' ? 'center' : 'start';
    p.style.transform = (settings.mirrorX ? 'scaleX(-1) ' : '') + (settings.mirrorY ? 'scaleY(-1)' : '');
    if (route.name === 'edit') updateStats();
    if (route.name === 'home') renderHome();
  }
  function lookChanged(relayout) {
    saveSettings(); syncSheet();
    if (route.name === 'play') {
      if (relayout) { renderReel(); }
      applyLook(); layout();
    }
  }

  /* ---------- wire up ---------- */
  function bind() {
    $('btnLang').onclick = function () { settings.lang = settings.lang === 'ar' ? 'en' : 'ar'; saveSettings(); applyLang(); };
    $('btnLook').onclick = openSheet;
    $('hLook').onclick = openSheet;
    $('sheetClose').onclick = closeSheet; $('sheetBack').onclick = closeSheet;
    $('btnNew').onclick = function () { var s = newScript('', ''); go('#/edit/' + s.id); setTimeout(function () { $('titleInput').focus(); }, 30); };
    $('cards').addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]'); if (o) { go('#/edit/' + o.getAttribute('data-open')); return; }
      var p = e.target.closest('[data-play]'); if (p) go('#/play/' + p.getAttribute('data-play'));
    });
    $('fileTxt').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var s = newScript(f.name.replace(/\.[^.]+$/, ''), String(r.result));
        toast(t('imported')); go('#/edit/' + s.id);
      };
      r.readAsText(f); e.target.value = '';
    };
    $('btnExportAll').onclick = function () { download('qare2-backup.json', Q.makeBackup(scripts, settings), 'application/json'); toast(t('exported')); };
    $('fileBackup').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var d = Q.parseBackup(String(r.result));
        if (!d) { toast(t('badFile')); return; }
        d.scripts.forEach(function (s) { var x = byId(s.id); if (x) { x.title = s.title; x.text = s.text; x.updated = s.updated; } else scripts.push(s); });
        var lang = settings.lang; settings = d.settings; settings.lang = lang;
        saveScripts(); saveSettings(); applyLang(); toast(t('imported'));
      };
      r.readAsText(f); e.target.value = '';
    };

    $('titleInput').oninput = queueSave;
    $('scriptInput').oninput = function () { updateStats(); queueSave(); };
    $('btnBack').addEventListener('click', flushSave);
    $('btnPlay').onclick = function () {
      flushSave();
      if (!Q.countWords(cur.text) && !cur.text.trim()) { toast(t('empty')); $('scriptInput').focus(); return; }
      go('#/play/' + cur.id);
    };
    $('btnDup').onclick = function () { flushSave(); var s = newScript(t('copyOf') + (cur.title || Q.deriveTitle(cur.text)), cur.text); toast(t('duplicated')); go('#/edit/' + s.id); };
    $('btnExport').onclick = function () { flushSave(); download(safeName(cur.title || Q.deriveTitle(cur.text)) + '.txt', cur.text, 'text/plain'); toast(t('exported')); };
    $('btnDelete').onclick = function () {
      var b = $('btnDelete');
      if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = t('deleteSure'); clearTimeout(delTimer); delTimer = setTimeout(resetDelete, 3500); return; }
      scripts = scripts.filter(function (s) { return s.id !== cur.id; }); cur = null; saveScripts(); toast(t('deleted')); go('#/');
    };

    /* prompter controls */
    $('hPlay').onclick = function (e) { e.stopPropagation(); toggle(); };
    $('hExit').onclick = function () { go('#/edit/' + cur.id); };
    $('hSlow').onclick = function () { setWpm(settings.wpm - 5); };
    $('hFast').onclick = function () { setWpm(settings.wpm + 5); };
    $('hSmall').onclick = function () { setSize(settings.size - 4); };
    $('hBig').onclick = function () { setSize(settings.size + 4); };
    $('hMirror').onclick = function () { settings.mirrorX = !settings.mirrorX; lookChanged(); };
    $('hFlip').onclick = function () { settings.mirrorY = !settings.mirrorY; lookChanged(); };
    $('hRestart').onclick = restart;
    $('btnAgain').onclick = function () { restart(); startMotion(); };
    $('hFull').onclick = function () {
      try { if (document.fullscreenElement) document.exitFullscreen(); else if (view.requestFullscreen) view.requestFullscreen(); else toast('Fullscreen not supported'); } catch (e) {}
    };

    /* touch, mouse, wheel on the stage */
    view.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.hud button') || e.target.closest('.end-card button')) return;
      P.drag = { y: e.clientY, x: e.clientX, t: performance.now(), moved: 0, pos: P.pos };
      try { view.setPointerCapture(e.pointerId); } catch (er) {}
    });
    view.addEventListener('pointermove', function (e) {
      if (!P.drag) { if (e.pointerType === 'mouse') showHud(false); return; }
      var dy = e.clientY - P.drag.y; P.drag.moved = Math.max(P.drag.moved, Math.abs(dy), Math.abs(e.clientX - P.drag.x));
      if (P.drag.moved > 8) { P.pos = Q.clamp(P.drag.pos - (settings.mirrorY ? -dy : dy), 0, P.max); render(); }
    });
    function endDrag(e) {
      if (!P.drag) return;
      var d = P.drag; P.drag = null;
      if (d.moved <= 8 && performance.now() - d.t < 600) {
        if (P.ended) return;
        if (P.playing || P.counting) pauseMotion(); else if ($('hud').classList.contains('hide')) showHud(true); else toggle();
      } else { P.ended = false; $('endCard').hidden = true; }
    }
    view.addEventListener('pointerup', endDrag);
    view.addEventListener('pointercancel', function () { P.drag = null; });
    view.addEventListener('wheel', function (e) { e.preventDefault(); nudge((settings.mirrorY ? -1 : 1) * e.deltaY); showHud(false); }, { passive: false });

    /* look sheet */
    function onRange(id, key, relayout, conv) { $(id).oninput = function () { settings[key] = conv ? conv(this.value) : +this.value; lookChanged(relayout); }; }
    onRange('rWpm', 'wpm'); onRange('rSize', 'size'); onRange('rLh', 'lineHeight'); onRange('rMargin', 'margin'); onRange('rCount', 'countdown');
    function onSeg(id, key, relayout) {
      $(id).addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; settings[key] = b.getAttribute('data-v'); lookChanged(relayout); });
    }
    onSeg('segTheme', 'theme'); onSeg('segFont', 'font'); onSeg('segDir', 'dir', true); onSeg('segAlign', 'align');
    $('cMirror').onchange = function () { settings.mirrorX = this.checked; lookChanged(); };
    $('cFlip').onchange = function () { settings.mirrorY = this.checked; lookChanged(); };
    $('cGuide').onchange = function () { settings.guide = this.checked; lookChanged(); };
    $('cCues').onchange = function () { settings.cues = this.checked; lookChanged(); };
    $('btnReset').onclick = function () { var l = settings.lang, w = settings.wpm; settings = Q.sanitizeSettings(null); settings.lang = l; settings.wpm = w; lookChanged(true); toast(t('resetDone')); };

    /* keyboard */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!$('sheet').hidden) { closeSheet(); return; } if (route.name === 'play') go('#/edit/' + cur.id); return; }
      if (route.name !== 'play' || !$('sheet').hidden) return;
      var tag = (e.target.tagName || '').toLowerCase(); if (tag === 'input' || tag === 'textarea') return;
      var k = e.key;
      if (k === ' ' || (k === 'Enter' && tag !== 'button')) { e.preventDefault(); toggle(); }
      else if (k === 'ArrowUp') { e.preventDefault(); setWpm(settings.wpm + 5); }
      else if (k === 'ArrowDown') { e.preventDefault(); setWpm(settings.wpm - 5); }
      else if (k === '+' || k === '=') setSize(settings.size + 4);
      else if (k === '-' || k === '_') setSize(settings.size - 4);
      else if (k === 'm' || k === 'M') { settings.mirrorX = !settings.mirrorX; lookChanged(); }
      else if (k === 'r' || k === 'R') restart();
      else if (k === 'f' || k === 'F') $('hFull').click();
      else if (k === 'PageDown') nudge(stage.clientHeight * 0.8);
      else if (k === 'PageUp') nudge(-stage.clientHeight * 0.8);
      else if (k === 'ArrowRight' || k === 'ArrowLeft') { nudge((k === 'ArrowRight' ? 1 : -1) * 60); }
    });
    window.addEventListener('resize', function () { if (route.name === 'play') layout(); });
    window.addEventListener('hashchange', onRoute);
    window.addEventListener('pagehide', function () { if (route.name === 'edit') flushSave(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && P.playing) pauseMotion(); });
  }

  function init() {
    view = $('view-play'); reel = $('reel'); stage = $('stage');
    load(); bind(); applyLang(); onRoute();
  }
  init();
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();
