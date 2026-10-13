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
  // Hinweis für Termine mit eigenen Linsen: ohne getragene Linsen keine Kontrolle
  const wear = kid => (kid ? 'Bitte lassen Sie Ihr Kind die Kontaktlinsen beim Termin tragen.' : 'Bitte tragen Sie Ihre Kontaktlinsen beim Termin.') + ' Sonst können wir sie nicht kontrollieren.';

  // Nach dem Buchen: erst die Bestätigung, dann taucht das Nachrichten-Symbol mit roter 1 auf.
  // Antippen (oder nach ein paar Sekunden von selbst) öffnet den Chat von Wörle.Optik – passt sich jeder Breite an.
  // m = {name, day, time, hint}; onRestart startet den Terminfinder neu
  // Genau eine SMS mit höchstens 140 Zeichen (Vorgabe Marco). Für alle Terminarten nachgerechnet: längste = 140.
  const SMS_HINT = {
    wear:  'Bitte Linsen tragen, sonst ist keine Kontrolle möglich.',
    kid:   'Linsen bitte eingesetzt lassen, sonst keine Kontrolle möglich.',
    fit:   'Bitte Brille und Brillenpass mitbringen.',
    med:   'Bitte Verordnung und Befunde mitbringen.',
    brille:'Bitte aktuelle Brille mitbringen.',
    befund:'Bitte vorhandene Befunde mitbringen.'
  };
  function smsText(m){
    const wd = m.day.toLocaleDateString('de-DE', {weekday:'short'}), dm = m.day.toLocaleDateString('de-DE', {day:'2-digit', month:'2-digit'});
    const t = `Termin bestätigt: ${m.name}, ${wd}, ${dm}, ${m.time} Uhr. ${SMS_HINT[m.hint]}`;
    return t.length + 24 <= 140 ? t + ' Wir freuen uns auf Sie!' : t;
  }
  const MSG = '<svg viewBox="0 0 60 60" aria-hidden="true"><path fill="#fff" d="M30 12.5c-11.9 0-21.5 7.8-21.5 17.4 0 5.5 3.2 10.4 8.2 13.6-.4 2.6-1.7 5-3.7 6.9 4-.3 7.6-1.8 10.2-3.9 2.2.5 4.4.8 6.8.8 11.9 0 21.5-7.8 21.5-17.4S41.9 12.5 30 12.5z"/></svg>';
  function sms(phone, m, onRestart){
    phone.querySelectorAll('.msg-pop,.ios-chat').forEach(e => e.remove());
    const red = reduced(), now = new Date(), t = hhmm(now.getHours() * 60 + now.getMinutes());
    const pop = document.createElement('button');
    pop.type = 'button'; pop.className = 'msg-pop'; pop.setAttribute('aria-label', 'Neue Nachricht von Wörle.Optik öffnen');
    pop.innerHTML = `<span class="msg-ic">${MSG}<span class="msg-badge" aria-hidden="true">1</span></span><span class="msg-tx"><b>Neue Nachricht</b><small>Tippen zum Öffnen</small></span>`;
    const chat = document.createElement('div');
    chat.className = 'ios-chat'; chat.hidden = true;
    chat.innerHTML = `<div class="ios-ch"><button type="button" class="ios-bk" aria-label="Zurück zur Bestätigung">${ic('chevron-left', 26)}</button><div class="ios-who"><span class="ios-av">WO</span><b>Wörle.Optik</b></div></div>
      <div class="ios-log" aria-live="polite"><div class="ios-col"><p class="ios-meta">Textnachricht · SMS<br>Heute ${t}</p></div></div>
      <div class="ios-in"><div class="ios-inw"><span class="ios-field" data-ph="Textnachricht"></span><span class="ios-send">${ic('arrow-up-right', 16)}</span></div></div>`;
    phone.append(pop, chat);
    const log = chat.querySelector('.ios-log'), col = chat.querySelector('.ios-col'), field = chat.querySelector('.ios-field'), send = chat.querySelector('.ios-send');
    const wait = ms => new Promise(r => setTimeout(r, red ? 0 : ms));
    const alive = () => chat.isConnected;
    const add = (cls, html, tag) => { const b = document.createElement(tag || 'div'); b.className = cls; b.innerHTML = html; col.appendChild(b); log.scrollTop = log.scrollHeight; return b; };
    async function incoming(html, ms){
      const ty = add('bub in typing', '<i></i><i></i><i></i>');
      await wait(ms); ty.remove(); if (!alive()) return false;
      add('bub in', html); await wait(550); return alive();
    }
    const text = smsText(m);
    let started = false;
    async function play(){
      if (started) return; started = true;
      await wait(450);
      if (!await incoming(text, 1600)) return;
      const msg = 'Danke, ich freue mich schon auf den Termin!';
      await wait(500);
      for (let i = 1; i <= msg.length; i++) { field.textContent = msg.slice(0, i); if (!red) await wait(34); if (!alive()) return; }
      send.classList.add('on'); await wait(380); if (!alive()) return;
      field.textContent = ''; send.classList.remove('on');
      add('bub out', msg); await wait(800); if (!alive()) return;
      const r = add('ios-restart', ic('refresh-cw', 16) + 'Terminfinder neu starten', 'button'); r.type = 'button';
      add('ios-fine', `Vorschau. 1 SMS über Timify (${text.length} von 140 Zeichen), als Option.`, 'p');
      r.addEventListener('click', () => { pop.remove(); chat.remove(); onRestart(); });
    }
    // öffnet sich von selbst, wenn niemand tippt
    const auto = setTimeout(() => open(), red ? 1500 : 6000);
    function open(){
      if (!alive()) return;
      clearTimeout(auto);
      const a = pop.querySelector('.msg-ic').getBoundingClientRect(), p = phone.getBoundingClientRect();
      chat.style.setProperty('--ox', (a.left + a.width / 2 - p.left) + 'px');
      chat.style.setProperty('--oy', (a.top + a.height / 2 - p.top) + 'px');
      chat.classList.remove('closing'); chat.hidden = false; pop.classList.add('read');
      play();
    }
    pop.addEventListener('click', open);
    chat.querySelector('.ios-bk').addEventListener('click', () => {
      chat.classList.add('closing');
      setTimeout(() => { chat.hidden = true; chat.classList.remove('closing'); }, red ? 0 : 260);
    });
  }

  return {reduced, hhmm, dLong, iso, days, slots, first, list, progress, swap, pick, cal, calClick, wear, sms, smsText};
})();
