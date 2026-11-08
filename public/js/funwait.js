/* ============================================================
   FunWait · Lógica compartida (window.FW)
   La usan el hub y todos los minijuegos.
   ============================================================ */
window.FW = (function () {
  const PREF_KEY = 'funwait:prefs';

  function load() { try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch (e) { return {}; } }
  const prefs = Object.assign({ sound: true, rulesSeen: {}, vistos: {} }, load());
  function save() { try { localStorage.setItem(PREF_KEY, JSON.stringify(prefs)); } catch (e) {} }

  /* ---------- Pantallas ---------- */
  let hayVersionNueva = false;
  function screen(id) {
    document.querySelectorAll('.fw-screen').forEach(s => s.classList.remove('is-active'));
    const el = document.getElementById(id);
    if (el) el.classList.add('is-active');
    if (id === 'home' && hayVersionNueva) location.reload();
    return el;
  }

  /* ---------- Audio (WebAudio, sin archivos) ---------- */
  let ctx = null;
  function ac() { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); return ctx; }
  function unlock() { if (prefs.sound) { try { ac().resume(); } catch (e) {} } }
  function tone(freq, dur, type, vol) {
    if (!prefs.sound) return;
    try {
      const c = ac(), o = c.createOscillator(), g = c.createGain();
      o.type = type || 'square'; o.frequency.value = freq;
      o.connect(g); g.connect(c.destination);
      g.gain.setValueAtTime(0.0001, c.currentTime);
      g.gain.exponentialRampToValueAtTime(vol || 0.3, c.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
      o.start(); o.stop(c.currentTime + dur);
    } catch (e) {}
  }
  function boom() {
    if (!prefs.sound) return;
    try {
      const c = ac(), dur = 0.9, n = c.sampleRate * dur;
      const buf = c.createBuffer(1, n, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2);
      const src = c.createBufferSource(); src.buffer = buf;
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
      const g = c.createGain(); g.gain.value = 0.7;
      src.connect(f); f.connect(g); g.connect(c.destination); src.start();
    } catch (e) {}
  }
  const audio = {
    tic: () => tone(900, 0.05, 'square', 0.25),
    cuenta: (f) => tone(f || 440, 0.2, 'sine', 0.3),
    acierto: () => { tone(660, 0.1); setTimeout(() => tone(880, 0.14), 90); },
    pasar: () => tone(200, 0.2, 'sawtooth'),
    fin: () => { tone(523, 0.15); setTimeout(() => tone(392, 0.15), 150); setTimeout(() => tone(330, 0.3), 300); },
    boom, tone
  };

  /* ---------- Háptica ---------- */
  function haptic(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

  /* ---------- Wake lock (pantalla encendida) ---------- */
  let wl = null;
  async function wakeLock() { try { if ('wakeLock' in navigator) wl = await navigator.wakeLock.request('screen'); } catch (e) {} }
  function releaseWake() { try { if (wl) { wl.release(); wl = null; } } catch (e) {} }

  /* ---------- Cuenta atrás (3·2·1·¡YA!) ---------- */
  function countdown(numEl, onDone) {
    let n = 3;
    const anim = () => { numEl.style.animation = 'none'; void numEl.offsetWidth; numEl.style.animation = ''; };
    numEl.textContent = n; anim(); audio.cuenta(440);
    const id = setInterval(() => {
      n--;
      if (n > 0) { numEl.textContent = n; anim(); audio.cuenta(440); }
      else { clearInterval(id); numEl.textContent = t('countdown.go'); anim(); audio.cuenta(660); setTimeout(onDone, 450); }
    }, 1000);
    return () => clearInterval(id);
  }

  /* ---------- Idioma ---------- */
  const LANG = 'es';
  const DICT = window.FW_I18N || {};
  const plurales = new Intl.PluralRules(LANG);
  const rellenar = (txt, vars) => txt.replace(/\{(\w+)\}/g, (m, v) => (vars && v in vars ? vars[v] : m));
  function t(key, vars) { return key in DICT ? rellenar(DICT[key], vars) : key; }
  function tn(key, n) {
    if (!(key in DICT)) return key;
    return rellenar(DICT[key][plurales.select(n)] || DICT[key].other, { n });
  }
  function applyI18n(root) {
    const el = root || document;
    el.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = t(e.dataset.i18n); });
    el.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = t(e.dataset.i18nHtml); });
    el.querySelectorAll('[data-i18n-aria-label]').forEach(e => { e.setAttribute('aria-label', t(e.dataset.i18nAriaLabel)); });
  }

  /* ---------- Contenido de los juegos (JSON por idioma) ---------- */
  async function loadContent(game) {
    const res = await fetch(`./data/${LANG}/${game}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  /* ---------- Utilidades ---------- */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // Elige al azar sin repetir hasta agotar la lista, y lo recuerda entre partidas
  // (prefs.vistos[juego][grupo]). Al agotarla vuelve a empezar, sin repetir justo el último.
  function pickUnused(game, group, items, idOf) {
    const porJuego = prefs.vistos[game] || (prefs.vistos[game] = {});
    const vistos = porJuego[group] || [];
    const ya = new Set(vistos);
    let libres = items.filter(x => !ya.has(idOf(x)));
    let base = vistos;
    if (!libres.length) {
      const ultimo = vistos[vistos.length - 1];
      libres = items.filter(x => idOf(x) !== ultimo);
      base = [];
    }
    const elegido = libres[Math.floor(Math.random() * libres.length)];
    porJuego[group] = [...base, idOf(elegido)];
    save();
    return elegido;
  }
  function flash(el) { el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on'); }
  function randomGame(urls) { location.href = urls[Math.floor(Math.random() * urls.length)]; }
  // Tarjeta de paquete/tema. Sin color = tarjeta "al azar".
  function tile(emoji, nombre, color, onClick) {
    const b = document.createElement('button');
    b.className = color ? 'fw-tile' : 'fw-tile fw-tile--random';
    if (color) { b.style.background = color; b.style.color = '#fff'; }
    const e = document.createElement('span'); e.className = 'emoji'; e.textContent = emoji;
    const n = document.createElement('span'); n.textContent = nombre;
    b.append(e, n); b.onclick = onClick;
    return b;
  }

  /* ---------- Preferencias: enlaces de UI ---------- */
  function bindSoundToggle(el) {
    const paint = () => el.classList.toggle('is-on', prefs.sound);
    paint();
    el.addEventListener('click', () => { prefs.sound = !prefs.sound; save(); paint(); if (prefs.sound) unlock(); });
  }
  function rulesSeen(game) { return !!prefs.rulesSeen[game]; }
  function setRulesSeen(game, v) { prefs.rulesSeen[game] = !!v; save(); }

  /* ---------- Service worker ---------- */
  // Una versión nueva se aplica recargando, pero solo en la pantalla de inicio:
  // en partida se espera a que vuelva a ella (ver screen). Sin controlador es la
  // primera instalación: no hay versión anterior que sustituir ni que recargar.
  function registrarSW() {
    if (!('serviceWorker' in navigator)) return;
    const sw = navigator.serviceWorker;
    const hayAnterior = !!sw.controller;
    sw.addEventListener('controllerchange', () => {
      if (!hayAnterior || hayVersionNueva) return;
      hayVersionNueva = true;
      if (document.getElementById('home')?.classList.contains('is-active')) location.reload();
    });
    window.addEventListener('load', async () => {
      try {
        const reg = await sw.register('./sw.js');
        // Una app instalada puede pasar días abierta en segundo plano sin navegar.
        document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
      } catch (e) {}
    });
  }
  registrarSW();

  // funwait.js se carga al final del <body>: las pantallas ya existen y siguen
  // ocultas hasta el primer FW.screen, así que nunca se ven sin traducir.
  document.documentElement.lang = LANG;
  applyI18n();

  return {
    t, tn, applyI18n, prefs, save, screen, audio, unlock, haptic, wakeLock, releaseWake,
    countdown, shuffle, pickUnused, flash, randomGame, tile, loadContent, bindSoundToggle, rulesSeen, setRulesSeen
  };
})();
