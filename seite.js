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

// Passwort-Seite: persönlich, mit Kreis 丸, Punkten beim Tippen und Blenden-Öffnung
// Vergleicht nur den SHA-256-Wert, das Passwort steht nicht im Quelltext
(() => {
  const H = '5052cc910d430a6ee117ff426d2ffe75cd4f11f01d1b9ce601d0526f94020b19';
  const gate = document.getElementById('gate'), form = document.getElementById('gateForm');
  if (!gate || !form) return;
  const root = document.documentElement, pw = document.getElementById('gatePw'), err = document.getElementById('gateErr');
  const dots = document.getElementById('gDots'), N = 12;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  dots.innerHTML = Array.from({length:N}, (_, i) => `<i style="--a:${i * 360 / N}deg"></i>`).join('');
  const h = new Date().getHours();
  document.getElementById('gHi').textContent = (h < 11 ? 'Guten Morgen' : h < 18 ? 'Hallo' : 'Guten Abend') + ', Horsti.';
  if (!root.classList.contains('locked')) { gate.remove(); return; }
  pw.focus();
  const light = n => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < n));
  pw.addEventListener('input', () => {
    const n = pw.value.length;
    form.classList.remove('bad'); err.textContent = '';
    light(n === 0 ? 0 : ((n - 1) % N) + 1);
  });
  const wait = ms => new Promise(r => setTimeout(r, reduced ? 0 : ms));
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw.value.trim().toLowerCase()));
    const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
    if (hex !== H) {
      err.textContent = 'Fast. Versuch es noch einmal.';
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake', 'bad');
      pw.select(); return;
    }
    try { sessionStorage.setItem('wo-ok', '1'); } catch (x) {}
    pw.blur(); light(N); form.classList.add('ok');
    await wait(750);
    gate.classList.add('ok');
    await wait(900);
    root.classList.add('revealing'); root.classList.remove('locked'); window.scrollTo(0, 0);
    gate.classList.add('open');
    await wait(1250);
    gate.remove(); root.classList.remove('revealing');
  });
})();
