/* Qare2 core logic: pure functions, shared by the app and the tests. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Qare = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var ARABIC = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  var LATIN = /[A-Za-z]/;

  // Direction of one piece of text: first strong letter wins.
  function detectDir(text) {
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (ARABIC.test(c)) return 'rtl';
      if (LATIN.test(c)) return 'ltr';
    }
    return 'ltr';
  }

  // Script syntax:
  //   plain line        -> spoken line
  //   // note           -> cue (shown dim, not counted as words)
  //   [pause] / [ ... ] -> a standalone bracket line is a cue too
  //   ---               -> section break
  //   blank line        -> small gap
  function parseScript(text) {
    var out = [];
    var lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var t = raw.trim();
      if (!t) {
        if (out.length && out[out.length - 1].type !== 'gap') out.push({ type: 'gap', text: '' });
        continue;
      }
      if (/^-{3,}$/.test(t)) { out.push({ type: 'break', text: '' }); continue; }
      if (t.indexOf('//') === 0) { out.push({ type: 'cue', text: t.replace(/^\/\/\s*/, ''), dir: detectDir(t.slice(2)) }); continue; }
      if (/^\[[^\]]*\]$/.test(t)) { out.push({ type: 'cue', text: t.slice(1, -1).trim(), dir: detectDir(t.slice(1)) }); continue; }
      out.push({ type: 'line', text: t, dir: detectDir(t) });
    }
    while (out.length && out[out.length - 1].type === 'gap') out.pop();
    return out;
  }

  function countWords(text) {
    var blocks = parseScript(text), n = 0;
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].type !== 'line') continue;
      var m = blocks[i].text.match(/[^\s]+/g);
      n += m ? m.length : 0;
    }
    return n;
  }

  function estimateSeconds(words, wpm) {
    if (!words || !wpm || wpm <= 0) return 0;
    return Math.round((words / wpm) * 60);
  }

  function formatTime(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

  // Pixels per second so that the text moves at `wpm` words per minute.
  function pxPerSecond(wpm, contentHeight, words) {
    if (!words) return 0;
    return (wpm / 60) * (contentHeight / words);
  }

  // Remaining reading time given scroll position.
  function remainingSeconds(pos, maxPos, wpm, words) {
    if (!maxPos) return 0;
    var left = clamp(1 - pos / maxPos, 0, 1);
    return estimateSeconds(words * left, wpm);
  }

  var DEFAULTS = {
    lang: 'ar',
    wpm: 130,
    size: 44,
    lineHeight: 1.45,
    margin: 8,
    mirrorX: false,
    mirrorY: false,
    dir: 'auto',          // auto | rtl | ltr
    align: 'start',       // start | center
    theme: 'ink',         // ink | paper | amber | green
    font: 'plex',         // plex | serif | mono
    guide: true,
    countdown: 3,
    cues: true
  };

  function sanitizeSettings(obj) {
    var s = {}, k;
    for (k in DEFAULTS) s[k] = DEFAULTS[k];
    if (!obj || typeof obj !== 'object') return s;
    if (obj.lang === 'ar' || obj.lang === 'en') s.lang = obj.lang;
    if (isFinite(obj.wpm)) s.wpm = clamp(Math.round(obj.wpm), 40, 320);
    if (isFinite(obj.size)) s.size = clamp(Math.round(obj.size), 20, 140);
    if (isFinite(obj.lineHeight)) s.lineHeight = clamp(+obj.lineHeight, 1.1, 2.2);
    if (isFinite(obj.margin)) s.margin = clamp(Math.round(obj.margin), 0, 30);
    s.mirrorX = !!obj.mirrorX; s.mirrorY = !!obj.mirrorY;
    if (['auto', 'rtl', 'ltr'].indexOf(obj.dir) > -1) s.dir = obj.dir;
    if (['start', 'center'].indexOf(obj.align) > -1) s.align = obj.align;
    if (['ink', 'paper', 'amber', 'green'].indexOf(obj.theme) > -1) s.theme = obj.theme;
    if (['plex', 'serif', 'mono'].indexOf(obj.font) > -1) s.font = obj.font;
    if (typeof obj.guide === 'boolean') s.guide = obj.guide;
    if (isFinite(obj.countdown)) s.countdown = clamp(Math.round(obj.countdown), 0, 10);
    if (typeof obj.cues === 'boolean') s.cues = obj.cues;
    return s;
  }

  function newId() { return 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  // Backup file: validate and normalise before importing.
  function parseBackup(json) {
    var data;
    try { data = JSON.parse(json); } catch (e) { return null; }
    if (!data || data.app !== 'qare2' || !Array.isArray(data.scripts)) return null;
    var scripts = [];
    for (var i = 0; i < data.scripts.length; i++) {
      var s = data.scripts[i];
      if (!s || typeof s.text !== 'string') continue;
      scripts.push({
        id: typeof s.id === 'string' && s.id ? s.id : newId(),
        title: typeof s.title === 'string' ? s.title.slice(0, 120) : '',
        text: s.text,
        updated: isFinite(s.updated) ? +s.updated : Date.now()
      });
    }
    return { scripts: scripts, settings: sanitizeSettings(data.settings) };
  }

  function makeBackup(scripts, settings) {
    return JSON.stringify({ app: 'qare2', version: 1, scripts: scripts, settings: settings }, null, 2);
  }

  function deriveTitle(text) {
    var blocks = parseScript(text);
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].type === 'line') return blocks[i].text.slice(0, 40);
    }
    return '';
  }

  return {
    detectDir: detectDir, parseScript: parseScript, countWords: countWords,
    estimateSeconds: estimateSeconds, formatTime: formatTime, clamp: clamp,
    pxPerSecond: pxPerSecond, remainingSeconds: remainingSeconds,
    DEFAULTS: DEFAULTS, sanitizeSettings: sanitizeSettings,
    parseBackup: parseBackup, makeBackup: makeBackup, newId: newId, deriveTitle: deriveTitle
  };
});
