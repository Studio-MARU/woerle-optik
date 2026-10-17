// Karussell für die beiden Varianten: Umschalter, Pfeile, Wischen
(() => {
  const track = document.getElementById('track');
  const slides = [...track.children];
  const tabs = [...document.querySelectorAll('.switch [data-slide]')];
  const prev = document.querySelector('.car-btn.prev'), next = document.querySelector('.car-btn.next');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, tm;

  function mark(i){
    cur = i;
    tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i)));
    prev.disabled = i === 0; next.disabled = i === slides.length - 1;
    slides.forEach((s, k) => s.toggleAttribute('inert', k !== i));
  }
  function show(i, smooth = true){
    i = Math.max(0, Math.min(slides.length - 1, i));
    track.scrollTo({left:i * track.clientWidth, behavior:smooth && !reduced() ? 'smooth' : 'instant'});
    mark(i);
  }
  tabs.forEach(t => t.addEventListener('click', () => show(+t.dataset.slide)));
  [prev, next].forEach(b => b.addEventListener('click', () => show(cur + +b.dataset.step)));
  track.addEventListener('scroll', () => { clearTimeout(tm); tm = setTimeout(() => mark(Math.round(track.scrollLeft / track.clientWidth)), 90); }, {passive:true});
  document.querySelector('.switch').addEventListener('keydown', e => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault(); show(cur + (e.key === 'ArrowRight' ? 1 : -1)); tabs[cur].focus();
  });
  document.querySelectorAll('[data-show]').forEach(b => b.addEventListener('click', () => {
    show(+b.dataset.show, false);
    document.getElementById('ausprobieren').scrollIntoView({behavior:reduced() ? 'auto' : 'smooth', block:'start'});
  }));
  window.addEventListener('resize', () => track.scrollTo({left:cur * track.clientWidth, behavior:'instant'}));
  window.CAR = {show};
  mark(0);
})();

// Anmeldung mit vierstelliger PIN (eigenes Ziffernfeld, keine Bildschirmtastatur)
// Vergleicht nur den SHA-256-Wert, die PIN steht nicht im Quelltext
(() => {
  const H = '0a95adbf8581859ae0cc477127abeaf4ad89916405c41855af8fbc482e1634e8';
  const gate = document.getElementById('gate'); if (!gate) return;
  const root = document.documentElement;
  if (!root.classList.contains('locked')) { gate.remove(); return; }
  const dots = [...document.querySelectorAll('#pinDots i')], pad = document.getElementById('pinPad');
  const mark = document.getElementById('pinMark'), msg = document.getElementById('pinMsg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const hr = new Date().getHours();
  // Gruß ohne Namen – der Name erscheint erst nach der richtigen PIN
  document.getElementById('gHi').textContent = (hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Guten Tag' : 'Guten Abend') + '.';
  // Bergbild erst einblenden, wenn es geladen ist (Nebel lichtet sich)
  const bg = new Image(); bg.src = 'maru-berg.webp';
  const ready = () => gate.classList.add('bg-ready');
  (bg.decode ? bg.decode() : Promise.reject()).then(ready, () => bg.complete ? ready() : bg.addEventListener('load', ready));
  setTimeout(ready, 2500);
  // Berg so legen, dass der Gipfel (bei 55,5 % / 38,5 % im Bild) knapp unter den PIN-Punkten steht – auf jedem Bildschirm
  const bgEl = gate.querySelector('.pin-bg'), stage = gate.querySelector('.pin-stage');
  function place(){
    if (!gate.isConnected) return;
    const w = bgEl.offsetWidth, h = bgEl.offsetHeight;
    const P = stage.offsetTop + dots[0].parentNode.offsetTop + 13 + 20 - bgEl.offsetTop;
    const ih = Math.max(w / 2000 * 1422, h, (h - P) / .615, P / .385), iw = ih / 1422 * 2000;
    const x = Math.min(0, Math.max(w - iw, w / 2 - .555 * iw)), y = Math.min(0, Math.max(h - ih, P - .385 * ih));
    bgEl.style.backgroundSize = iw + 'px ' + ih + 'px';
    bgEl.style.backgroundPosition = x + 'px ' + y + 'px';
    bgEl.style.transformOrigin = (x + .555 * iw) + 'px ' + (y + .385 * ih) + 'px';
    gate.style.setProperty('--gx', (bgEl.offsetLeft + x + .555 * iw) + 'px');
    gate.style.setProperty('--gy', (bgEl.offsetTop + y + .385 * ih) + 'px');
  }
  place(); addEventListener('resize', place);
  if (document.fonts) document.fonts.ready.then(place);
  let pin = '', busy = false;
  const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < pin.length));
  const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');

  async function press(k){
    if (busy) return;
    if (k === 'del') { pin = pin.slice(0, -1); return paint(); }
    if (pin.length >= 4) return;
    pin += k; paint();
    if (pin.length < 4) return;
    busy = true;
    await wait(180);
    (await sha(pin)) === H ? success() : fail();
  }
  async function fail(){
    msg.textContent = 'PIN nicht korrekt';
    gate.classList.add('bad');
    if (navigator.vibrate) navigator.vibrate([40, 40, 40]);
    await wait(700);
    gate.classList.remove('bad'); pin = ''; paint(); busy = false; msg.textContent = '';
  }
  async function success(){
    try { sessionStorage.setItem('wo-ok', '1'); } catch (e) {}
    msg.textContent = 'Willkommen, Horsti.';
    document.getElementById('pinWelcome').textContent = 'Willkommen, Horsti.';
    if (reduced) { root.classList.remove('locked'); gate.remove(); return; }
    gate.classList.add('ok');                     // Punkte leuchten nacheinander auf
    await wait(500);
    gate.classList.add('s1');                     // Ziffernfeld und Gruß treten zurück
    await wait(450);
    const r = mark.getBoundingClientRect();
    gate.style.setProperty('--my', (innerHeight / 2 - (r.top + r.height / 2)) + 'px');
    gate.classList.add('s2');                     // Logo wandert in die Mitte, Kamera fährt an den Gipfel, Licht geht auf
    await wait(650);
    gate.classList.add('s3');                     // Kreis schließt sich in Alpenglühen, Logo atmet
    await wait(1000);
    gate.classList.add('s4');                     // „Willkommen, Horsti.“
    await wait(1100);
    root.classList.add('revealing'); root.classList.remove('locked'); scrollTo(0, 0);
    gate.classList.add('open');                   // Kreis öffnet die Seite wie eine Blende
    await wait(1350);
    gate.remove(); root.classList.remove('revealing');
  }
  pad.addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
  document.addEventListener('keydown', e => {
    if (!gate.isConnected) return;
    if (/^[0-9]$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('del');
  });
})();

// „Zum Angebot“: Titel und Text fliegen zur Seite, der Button gleitet nach unten, das Angebot blendet ein.
// Danach ist der Button der WhatsApp-Link für das Erstgespräch.
(() => {
  const btn = document.getElementById('toOffer'); if (!btn) return;
  const scene = btn.closest('.ab-scene'), offer = document.getElementById('angebot');
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  let state = 0;
  function swap(){
    const before = btn.getBoundingClientRect().top;
    scene.classList.add('offer'); offer.hidden = false;
    btn.querySelector('.ab-cta-t').textContent = 'Erstgespräch vereinbaren';
    btn.href = btn.dataset.wa; btn.target = '_blank'; btn.rel = 'noopener';
    const after = btn.getBoundingClientRect().top;
    if (!reduced()) btn.animate([{transform:`translateY(${before - after}px)`}, {transform:'none'}], {duration:950, easing:'cubic-bezier(.65,0,.25,1)'});
    scrollTo({top:offer.getBoundingClientRect().top + scrollY - 96, behavior:reduced() ? 'auto' : 'smooth'});
    state = 2;
  }
  // Zurück zur Ausgangsansicht (Titel, Text, Button „So geht es weiter“), z. B. über „Über uns“ in der Leiste
  window.resetOffer = () => {
    if (state === 0) return;
    scene.classList.remove('go', 'offer'); offer.hidden = true;
    btn.querySelector('.ab-cta-t').textContent = 'So geht es weiter';
    btn.href = '#angebot'; btn.removeAttribute('target'); btn.removeAttribute('rel');
    state = 0;
  };
  btn.addEventListener('click', e => {
    if (state === 2) return;
    e.preventDefault(); e.stopPropagation();
    if (state === 1) return;
    state = 1;
    if (reduced()) return swap();
    scene.classList.add('go');
    setTimeout(swap, 720);
  });
})();

// Sprunglinks (Navigation, Logo) selbst ausführen – zuverlässig auch in eingebetteten Vorschauen
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const t = id ? document.getElementById(id) : null;
  if (!t) return;
  e.preventDefault();
  if (id === 'maru' && a.closest('.nav') && window.resetOffer) window.resetOffer();
  t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
});
