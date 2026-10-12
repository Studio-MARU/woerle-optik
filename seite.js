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

// Anmeldung mit sechsstelliger PIN (eigenes Ziffernfeld, keine Bildschirmtastatur)
// Vergleicht nur den SHA-256-Wert, die PIN steht nicht im Quelltext
(() => {
  const H = '81de4ee3f0c222423eb00aecf27584bd295fccb6acd50c947d1e23bc16ede546';
  const gate = document.getElementById('gate'); if (!gate) return;
  const root = document.documentElement;
  if (!root.classList.contains('locked')) { gate.remove(); return; }
  const dots = [...document.querySelectorAll('#pinDots i')], pad = document.getElementById('pinPad');
  const mark = document.getElementById('pinMark'), msg = document.getElementById('pinMsg');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const hr = new Date().getHours();
  document.getElementById('gHi').textContent = (hr < 11 ? 'Guten Morgen' : hr < 18 ? 'Hallo' : 'Guten Abend') + ', Horsti.';
  let pin = '', busy = false;
  const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < pin.length));
  const sha = async s => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map(b => b.toString(16).padStart(2, '0')).join('');

  async function press(k){
    if (busy) return;
    if (k === 'del') { pin = pin.slice(0, -1); return paint(); }
    if (pin.length >= 6) return;
    pin += k; paint();
    if (pin.length < 6) return;
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
    if (reduced) { root.classList.remove('locked'); gate.remove(); return; }
    gate.classList.add('ok');                     // Punkte leuchten nacheinander auf
    await wait(500);
    gate.classList.add('s1');                     // Ziffernfeld und Gruß treten zurück
    await wait(450);
    const r = mark.getBoundingClientRect();
    gate.style.setProperty('--my', (innerHeight / 2 - (r.top + r.height / 2)) + 'px');
    gate.classList.add('s2');                     // Logo wandert in die Mitte
    await wait(650);
    gate.classList.add('s3');                     // Kreis schließt sich, Logo atmet
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
