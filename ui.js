// Gemeinsame Bausteine für beide Terminfinder
window.UI = (() => {
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hhmm = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  const dLong = d => d.toLocaleDateString('de-DE', {weekday:'long', day:'numeric', month:'long'});
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // die nächsten 10 Werktage ab morgen
  function days(){
    const out = [], d = new Date(); d.setHours(0, 0, 0, 0);
    while (out.length < 10) { d.setDate(d.getDate() + 1); const w = d.getDay(); if (w > 0 && w < 6) out.push(new Date(d)); }
    return out;
  }
  // Freie Zeiten sind erfunden – später kommen sie aus Timify (Mo–Fr 09:00–18:30)
  function slots(dayIdx, min){
    const res = [];
    for (let m = 9 * 60; m + min <= 18 * 60 + 30; m += 30) {
      const x = Math.sin(dayIdx * 12.9898 + m * 78.233 + min) * 43758.5453;
      if (x - Math.floor(x) < 0.42) res.push(m);
    }
    return res;
  }
  function first(min, n){
    const out = [];
    for (let i = 0; i < 10 && out.length < n; i++) { const s = slots(i, min); if (s.length) out.push({day:i, time:s[0]}); }
    return out;
  }

  // Auswahl-Liste: rows = [{label, sub, icon, meta, tag, attrs, on}]
  function list(rows){
    return `<div class="list">${rows.map(r => `<button type="button" class="row${r.on ? ' on' : ''}" ${r.attrs || ''}>${r.icon ? `<span class="ic">${ic(r.icon, 22)}</span>` : ''}<span class="tx"><b>${r.label}${r.tag ? `<span class="tag">${r.tag}</span>` : ''}</b>${r.sub ? `<small>${r.sub}</small>` : ''}</span>${r.meta ? `<span class="meta">${r.meta}</span>` : ''}<span class="end">${ic(r.on ? 'check' : 'chevron-right', 18)}</span></button>`).join('')}</div>`;
  }
  function progress(el, total, idx){
    el.innerHTML = `<div class="seg">${Array.from({length:total}, (_, i) => `<i class="${i < idx ? 'done' : i === idx ? 'now' : ''}"></i>`).join('')}</div><span class="cnt">${Math.min(idx + 1, total)}/${total}</span>`;
  }
  // neuen Schritt einsetzen; die Tage-Leiste behält ihre Scroll-Position
  function swap(body, html, mode){
    const old = body.querySelector('.days'), sl = old ? old.scrollLeft : 0;
    body.innerHTML = `<div class="st${mode ? ' ' + mode : ''}">${html}</div>`;
    const nu = body.querySelector('.days'); if (nu && mode === 'still') nu.scrollLeft = sl;
  }
  // kurze sichtbare Bestätigung der Auswahl, dann weiter
  function pick(btn, fn){
    if (btn) { btn.classList.add('on'); const e = btn.querySelector('.end'); if (e) e.innerHTML = ic('check', 18); }
    setTimeout(fn, reduced() ? 0 : 170);
  }

  // Kalender wie in Timify: drei nächste Termine, auf Wunsch Tag, Tageszeit und Uhrzeit
  function cal(st, min){
    const ds = days(), q = first(min, 3);
    let h = `<div class="list">${q.map(x => {
      const on = st.day === x.day && st.time === x.time, d = ds[x.day];
      return `<button type="button" class="row${on ? ' on' : ''}" data-qd="${x.day}" data-qt="${x.time}"><span class="radio"></span><span class="tx"><b>${d.toLocaleDateString('de-DE', {weekday:'long'})}</b><small>${d.toLocaleDateString('de-DE', {day:'numeric', month:'long'})}</small></span><span class="time">${hhmm(x.time)}</span></button>`;
    }).join('')}<button type="button" class="row" data-more aria-expanded="${!!st.more}"><span class="ic">${ic('calendar', 22)}</span><span class="tx"><b>Andere Zeit wählen</b><small>Alle freien Termine der nächsten zwei Wochen</small></span><span class="end">${ic(st.more ? 'chevron-down' : 'chevron-right', 18)}</span></button></div>`;
    if (st.more) {
      const all = slots(st.day, min).filter(m => st.part === 'vm' ? m < 720 : st.part === 'nm' ? m >= 720 : true);
      h += `<div class="cal-more">
        <div class="segc" role="group" aria-label="Tageszeit">${[['alle','Ganztags'],['vm','Vormittags'],['nm','Nachmittags']].map(([k, l]) => `<button type="button" data-part="${k}" class="${st.part === k ? 'on' : ''}" aria-pressed="${st.part === k}">${l}</button>`).join('')}</div>
        <div class="days" role="group" aria-label="Tag">${ds.map((d, i) => `<button type="button" class="day${i === st.day ? ' on' : ''}" data-day="${i}" aria-pressed="${i === st.day}"><small>${d.toLocaleDateString('de-DE', {weekday:'short'})}</small><b>${d.getDate()}</b><small>${d.toLocaleDateString('de-DE', {month:'short'})}</small></button>`).join('')}</div>
        <div class="times" role="group" aria-label="Uhrzeit">${all.length ? all.map(m => `<button type="button" data-time="${m}" class="${m === st.time ? 'on' : ''}" aria-pressed="${m === st.time}">${hhmm(m)}</button>`).join('') : '<span class="none">Zu dieser Tageszeit ist nichts frei. Bitte einen anderen Tag wählen.</span>'}</div>
      </div>`;
    }
    return h;
  }
  // Klicks im Kalender; gibt true zurück, wenn sich etwas geändert hat
  function calClick(e, st){
    const q = e.target.closest('[data-qd]'); if (q) { st.day = +q.dataset.qd; st.time = +q.dataset.qt; return true; }
    if (e.target.closest('[data-more]')) { st.more = !st.more; return true; }
    const p = e.target.closest('[data-part]'); if (p) { st.part = p.dataset.part; st.time = null; return true; }
    const d = e.target.closest('[data-day]'); if (d) { st.day = +d.dataset.day; st.time = null; return true; }
    const t = e.target.closest('[data-time]'); if (t) { st.time = +t.dataset.time; return true; }
    return false;
  }
  return {reduced, hhmm, dLong, iso, days, slots, first, list, progress, swap, pick, cal, calClick};
})();
