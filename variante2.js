// Variante 2 – unser Vorschlag: Anliegen zuerst, Suche, Termin-Pass
(() => {
// Timify-Leistungen. Externe IDs legen wir selbst fest; Dauer, Team und Hinweis sind Beispiele.
// vor = Vorschlag von uns (nicht in der Skizze), min40 = eigene Leistung ab 40 mit mehr Zeit
const LENS = 'Bringen Sie Ihre Brille und, falls vorhanden, Ihren Brillenpass mit.';
const READ40 = ' Falls Sie eine Lesebrille haben, bringen Sie sie bitte auch mit.';
const SV = {
  'kl-kontrolle-weich':  {g:'b', topic:'meine', name:'Nachkontrolle weiche Linsen', min:20, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie den Linsenbehälter mit.', kw:'kontrolle nachkontrolle check weiche weich monatslinsen'},
  'kl-kontrolle-hart':   {g:'b', topic:'meine', name:'Nachkontrolle harte Linsen', min:20, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie den Linsenbehälter mit.', kw:'kontrolle nachkontrolle check harte hart formstabil'},
  'kl-kontrolle-skleral':{g:'b', topic:'meine', name:'Nachkontrolle Sklerallinsen', min:30, wer:'Spezialist/in Sklerallinsen', prep:'Bitte bringen Sie den Behälter Ihrer Sklerallinsen mit.', kw:'kontrolle nachkontrolle sklerallinsen skleral', vor:true},
  'kl-neu-weich':        {g:'b', topic:'meine', name:'Neue weiche Linsen (Folgeversorgung)', min:30, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie Ihren Linsenpass mit.', kw:'neue linsen nachkauf ersatz folgeversorgung weiche weich nachbestellen'},
  'kl-neu-hart':         {g:'b', topic:'meine', name:'Neue harte Linsen (Folgeversorgung)', min:30, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie Ihren Linsenpass mit.', kw:'neue linsen ersatz folgeversorgung harte hart formstabil'},
  'kl-neu-skleral':      {g:'b', topic:'meine', name:'Neue Sklerallinsen (Folgeversorgung)', min:45, wer:'Spezialist/in Sklerallinsen', prep:'Bitte bringen Sie den Behälter Ihrer Sklerallinsen mit.', kw:'neue linsen folgeversorgung sklerallinsen skleral'},
  'ea-sport':    {g:'e', topic:'anpassen', icon:'dumbbell', name:'Erstanpassung · Linsen für ab und zu', desc:'z. B. für den Sport oder besondere Anlässe', min:45, min40:60, wer:'Kontaktlinsen-Team', prep:LENS, kw:'sport ab und zu gelegentlich wochenende ausprobieren erstanpassung'},
  'ea-tag':      {g:'e', topic:'anpassen', icon:'sun', name:'Erstanpassung · Tageslinsen', desc:'jeden Tag frisch, ohne Pflegemittel', min:45, min40:60, wer:'Kontaktlinsen-Team', prep:LENS, kw:'tageslinsen tageslinse taeglich eintageslinsen erstanpassung'},
  'ea-hart':     {g:'e', topic:'anpassen', icon:'kl-new', name:'Erstanpassung · harte Linsen', desc:'formstabil, individuell angepasst', min:60, min40:75, wer:'Kontaktlinsen-Team', prep:LENS, kw:'harte linsen hart formstabil erstanpassung'},
  'ea-gleit':    {g:'e', topic:'anpassen', icon:'book-open', name:'Erstanpassung · Gleitsichtlinsen', desc:'scharf in der Nähe und in der Ferne, meist ab 40', min:75, wer:'Kontaktlinsen-Team', prep:LENS + READ40, kw:'gleitsicht multifokal lesen naehe ferne alterssichtig erstanpassung'},
  'ea-beratung': {g:'e', topic:'anpassen', icon:'circle-help', name:'Erstberatung Kontaktlinsen', desc:'Wir finden gemeinsam heraus, welche Linsen passen', min:60, min40:75, wer:'Kontaktlinsen-Team', prep:LENS, kw:'beratung unsicher weiss nicht erstberatung ausprobieren kontaktlinsen', vor:true},
  'med-keratokonus': {g:'m', topic:'med', icon:'keratokonus', name:'Erstberatung Keratokonus', min:90, wer:'Spezialist/in Keratokonus', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und vorhandene Befunde (z. B. Topographie) mit.', kw:'keratokonus hornhaut kegel'},
  'med-op':      {g:'m', topic:'med', icon:'bandage', name:'Erstberatung nach OP oder Verletzung', desc:'nach Hornhauttransplantation, Augenverletzung oder Laser-OP', min:90, wer:'Spezialist/in Kontaktlinseninstitut', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und den OP- oder Klinikbericht mit.', kw:'transplantation transplantat keratoplastik hornhaut verletzung unfall laser lasik operation op'},
  'med-skleral': {g:'m', topic:'med', icon:'kl-lens', name:'Erstanpassung Sklerallinsen', min:90, wer:'Spezialist/in Sklerallinsen', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und vorhandene Befunde mit.', kw:'sklerallinsen skleral erstanpassung'},
  'med-iris':    {g:'m', topic:'med', icon:'iris', name:'Beratung Irislinse', desc:'Farb- und Irislinsen, z. B. nach einer Verletzung', min:60, wer:'Spezialist/in Kontaktlinseninstitut', prep:'Bitte bringen Sie vorhandene Befunde und, falls möglich, ein Foto Ihres anderen Auges mit.', kw:'irislinse iris farblinse farbe verletzung prothetisch'},
  'kind-erst':      {g:'k', topic:'kind', name:'Erstversorgung Kind (Baby bis 11 Jahre)', min:90, wer:'Kinder-Kontaktlinsen', prep:'Bitte bringen Sie alle Befunde der Augenklinik oder des Augenarztes mit. Wir nehmen uns viel Zeit für Ihr Kind.', kw:'kind kinder baby saeugling kleinkind erstversorgung', vor:true},
  'kind-kontrolle': {g:'k', topic:'kind', name:'Nachkontrolle Kind', min:30, wer:'Kinder-Kontaktlinsen', prep:'Bitte bringen Sie den Linsenbehälter mit.', kw:'kind kinder baby kleinkind kontrolle nachkontrolle'},
  'brille-neu':   {g:'r', topic:'brille', name:'Sehtest & Brillenberatung', min:45, wer:'Brillen-Team', prep:'Bringen Sie Ihre aktuelle Brille mit, falls Sie eine haben.', kw:'brille sehtest augen messen brillenberatung lesebrille gleitsichtbrille'},
  'brille-stamm': {g:'r', topic:'brille', name:'Sehtest & Brillenberatung (Stammkunde)', min:30, wer:'Brillen-Team', prep:'Bringen Sie Ihre aktuelle Brille mit.', kw:'brille sehtest brillenberatung wieder stammkunde'}
};
const GR = {b:'Kontaktlinsen · Betreuung', e:'Kontaktlinsen · Erstanpassung', m:'Medizinische Linsen', k:'Kinder', r:'Brille'};
const GICON = {b:'kl-check', e:'kl-lens', m:'eye-med', k:'baby', r:'glasses'};
const TOPICS = {
  meine:   {label:'Meine Kontaktlinsen', icon:'kl-check', step:'betreuung', sub:'Kontrolle oder neue Linsen'},
  anpassen:{label:'Kontaktlinsen anpassen', icon:'kl-lens', step:'wunsch', sub:'Zum ersten Mal oder Wechsel zu uns'},
  med:     {label:'Medizinische Linsen', icon:'eye-med', step:'med', sub:'Keratokonus, nach OP, Skleral- und Irislinsen'},
  kind:    {label:'Für mein Kind', icon:'baby', step:'kind', sub:'Vom Baby bis 11 Jahre'},
  brille:  {label:'Brille & Sehtest', icon:'glasses', step:'brille', sub:'Beratung, Sehtest, neue Brille'}
};
const WL = {'ea-sport':'Linsen für ab und zu', 'ea-tag':'Tageslinsen', 'ea-hart':'Harte Linsen', 'ea-gleit':'Gleitsichtlinsen', 'ea-beratung':'Weiß ich noch nicht'};
const MEDL = {'med-keratokonus':'Keratokonus', 'med-op':'Nach OP oder Verletzung', 'med-skleral':'Sklerallinsen', 'med-iris':'Irislinse'};
const ROWS = [['weich','Weiche Linsen'],['hart','Harte Linsen'],['skleral','Sklerallinsen']];

const root = document.getElementById('fb');
const body = root.querySelector('.ph-body'), prog = root.querySelector('.ph-prog'), backBtn = root.querySelector('.ph-back'), techBtn = root.querySelector('.ph-tech'), sumEl = root.querySelector('.ph-sum');
const techEl = document.getElementById('fbTech');
const fresh = () => ({step:'start', topic:null, wish:null, age:null, svc:null, day:null, time:null, more:false, part:'alle', q:'', vo:null});
let V = fresh(), H = [], lock = false, flipTimer = null;

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;'}[c]));
const norm = s => s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
function find(q){
  const toks = norm(q).split(/\s+/).filter(Boolean);
  if (!toks.length) return [];
  return Object.keys(SV).filter(id => { const s = SV[id], hay = norm(s.name + ' ' + s.kw + ' ' + GR[s.g]); return toks.every(t => hay.includes(t)); }).slice(0, 6);
}
function mark(text, q){
  const t = q.trim().toLowerCase().split(/\s+/)[0] || '', i = t.length > 1 ? text.toLowerCase().indexOf(t) : -1;
  return i < 0 ? text : text.slice(0, i) + '<mark>' + text.slice(i, i + t.length) + '</mark>' + text.slice(i + t.length);
}
function path(){
  if (!V.topic) return ['start', 'frage', 'termin', 'daten'];
  const p = ['start', TOPICS[V.topic].step];
  if (V.topic === 'anpassen' && V.wish !== 'ea-gleit') p.push('alter');
  return p.concat(['termin', 'daten']);
}
// gewählte Timify-Leistung, ab 40 als eigene Leistung mit mehr Zeit
function svc(){
  if (!V.svc) return null;
  const s = SV[V.svc];
  if (V.age === '40' && s.min40) return Object.assign({}, s, {id:V.svc + '-40', name:s.name + ' (ab 40)', min:s.min40, prep:s.prep + READ40, is40:true});
  return Object.assign({id:V.svc}, s);
}
function toTermin(){
  V.step = 'termin'; V.more = false; V.part = 'alle'; V.time = null;
  const f = UI.first(svc().min, 1)[0]; V.day = f ? f.day : 0;
}
function pickSvc(id){
  const s = SV[id];
  V.topic = s.topic; V.q = ''; V.age = null;
  if (s.g === 'e') { V.wish = id; if (s.min40) { V.svc = null; V.step = 'alter'; return; } }
  V.svc = id; toTermin();
}

function resHTML(){
  if (!V.q.trim()) {
    // Stammkunden zuerst und deutlich abgesetzt, darunter alle anderen Themen
    const feat = UI.list([{label:TOPICS.meine.label, tag:'Stammkunde', sub:'Kontrolle oder neue Linsen', icon:TOPICS.meine.icon, attrs:'data-topic="meine"'}]).replace('<div class="list">', '<div class="list feat">');
    const rest = UI.list(Object.keys(TOPICS).filter(k => k !== 'meine').map(k => ({label:TOPICS[k].label, sub:TOPICS[k].sub, icon:TOPICS[k].icon, attrs:`data-topic="${k}"`})));
    return `<p class="lh">Schon Kunde bei Wörle?</p>${feat}<p class="lh">Alle anderen Themen</p>${rest}`;
  }
  const r = find(V.q);
  if (!r.length) return '<p class="empty">Dazu haben wir nichts gefunden. Versuchen Sie ein anderes Wort oder wählen Sie ein Thema.</p>';
  return UI.list(r.map(id => { const s = SV[id]; return {label:mark(s.name, V.q), sub:GR[s.g], meta:'ca. ' + s.min + (s.min40 ? '–' + s.min40 : '') + ' Min.', icon:GICON[s.g], attrs:`data-svc="${id}"`}; }));
}
const STEPS = {
  start: () => `<h2 class="q">Wobei dürfen wir helfen?</h2>
    <div class="search">${ic('search', 18)}<input id="vSearch" type="search" enterkeyhint="go" autocomplete="off" placeholder="z. B. Kontrolle oder Sport" value="${esc(V.q)}" aria-label="Termin suchen"><button type="button" class="clr${V.q ? '' : ' off'}" data-act="clear" aria-label="Suche leeren">${ic('x', 18)}</button></div>
    <div id="vRes">${resHTML()}</div>`,
  betreuung: () => `<h2 class="q">Was steht an?</h2><p class="sub">„Neue Linsen“ heißt: dieselbe Sorte wie bisher, frisch angepasst.</p>
    <div class="mx">${ROWS.map(([k, l]) => `<div class="mx-row"><b>${l}</b><div class="seg2"><button type="button" data-svc="kl-kontrolle-${k}" aria-label="Kontrolle, ${l}">Kontrolle<small>ca. ${SV['kl-kontrolle-' + k].min} Min.</small></button><button type="button" data-svc="kl-neu-${k}" aria-label="Neue Linsen, ${l}">Neue Linsen<small>ca. ${SV['kl-neu-' + k].min} Min.</small></button></div></div>`).join('')}</div>
    <p class="more">Andere Linsenart ausprobieren? <button type="button" class="lnk" data-jump="anpassen">Kontaktlinsen anpassen lassen</button></p>`,
  wunsch: () => `<h2 class="q">Was wünschen Sie sich?</h2><p class="sub">Wenn Sie unsicher sind, beraten wir Sie im Termin.</p>
    ${UI.list(Object.keys(WL).map(id => ({label:WL[id], sub:SV[id].desc, icon:SV[id].icon, attrs:`data-wish="${id}"`})))}
    <p class="more">Augenerkrankung, z. B. Keratokonus? <button type="button" class="lnk" data-jump="med">Medizinische Linsen</button></p>`,
  alter: () => `<h2 class="q">Wie alt sind Sie?</h2><p class="sub">Damit wir genug Zeit für Sie einplanen.</p>
    <div class="age"><button type="button" data-age="u40"><span class="n">12–39</span><small>Jahre</small></button><button type="button" data-age="40"><span class="n">40+</span><small>Jahre, mit Prüfung fürs Sehen in der Nähe</small></button></div>
    <p class="why">${ic('info', 16)}<span><b>Warum wir fragen:</b> Ab etwa 40 lässt das Sehen in der Nähe nach. Dann prüfen wir zusätzlich, ob Ihre Linsen auch beim Lesen passen.</span></p>
    <p class="more">Jünger als 12? <button type="button" class="lnk" data-jump="kind">Für mein Kind</button></p>`,
  med: () => `<h2 class="q">Worum geht es?</h2><p class="sub">Haben Sie eine ärztliche Verordnung? Bitte bringen Sie sie zum Termin mit.</p>
    ${UI.list(Object.keys(MEDL).map(id => ({label:MEDL[id], sub:SV[id].desc || 'Erster Termin', meta:'ca. ' + SV[id].min + ' Min.', icon:SV[id].icon, attrs:`data-svc="${id}"`})))}
    <p class="more">Sie tragen schon medizinische Linsen von uns? <button type="button" class="lnk" data-jump="meine">Meine Kontaktlinsen</button></p>`,
  kind: () => two('Ist Ihr Kind schon bei uns in Betreuung?', 'Für Kinder vom Babyalter bis 11 Jahre. Wir nehmen uns viel Zeit.', [['kind-kontrolle', 'Ja, zur Nachkontrolle'], ['kind-erst', 'Nein, es ist der erste Termin']]),
  brille: () => two('Waren Sie schon einmal zum Sehtest bei uns?', 'Damit wir die passende Zeit einplanen.', [['brille-stamm', 'Ja'], ['brille-neu', 'Nein, zum ersten Mal']]),
  termin: () => { const s = svc(); return `<p class="kicker">Kalender von Timify</p><h2 class="q">Wann passt es Ihnen?</h2><p class="sub">${s.name} · ca. ${s.min} Minuten</p>${UI.cal(V, s.min)}
    <div class="push"><button type="button" class="btn block" data-act="next" ${V.time === null ? 'disabled' : ''}>Weiter</button><p class="fine">Vereinfachte Vorschau. Ab hier zeigt Timify seinen Kalender in Ihren Farben.</p></div>`; },
  daten: () => {
    const d = UI.days()[V.day];
    const vo = V.topic === 'med' ? `<p class="flabel">Haben Sie eine ärztliche Verordnung?</p><div class="chips" role="group" aria-label="Ärztliche Verordnung">${[['ja','Ja'],['nein','Nein'],['unklar','Weiß ich nicht']].map(([k, l]) => `<button type="button" data-vo="${k}" class="${V.vo === k ? 'on' : ''}" aria-pressed="${V.vo === k}">${l}</button>`).join('')}</div>` : '';
    return `<p class="kicker">Formular von Timify</p><h2 class="q">Fast geschafft</h2><p class="sub">${UI.dLong(d)}, ${UI.hhmm(V.time)} Uhr</p>${vo}
      <div class="ff"><span>Vor- und Nachname</span><i>Feld in Timify</i></div>
      <div class="ff"><span>E-Mail</span><i>Feld in Timify</i></div>
      <div class="ff"><span>Telefon (optional)</span><i>Feld in Timify</i></div>
      <div class="push"><button type="button" class="btn block" data-act="book">Termin buchen (Vorschau)</button><p class="fine">In der Vorschau wird nichts gesendet oder gebucht.</p></div>`;
  },
  fertig: () => {
    const s = svc(), d = UI.days()[V.day];
    const rows = [['Thema', TOPICS[V.topic].label], ['Terminart', s.name], ['Dauer', 'ca. ' + s.min + ' Minuten'], ['Termin', UI.dLong(d) + ', ' + UI.hhmm(V.time) + ' Uhr'], ['Bitte mitbringen', s.prep]];
    return `<h2 class="q">So sieht die Bestätigung aus</h2><p class="sub">Timify bestätigt den Termin per E-Mail und erinnert vorher. Tippen Sie auf die Karte, um sie umzudrehen.</p>
      <div class="pass" data-act="flip" role="button" tabindex="0" aria-label="Bestätigung umdrehen"><div class="pass-in">
        <div class="pf front"><div class="pass-h"><span>Bestätigung</span><span>Vorschau</span></div>${rows.map(([k, v]) => `<div class="pass-r"><small>${k}</small><div>${v}</div></div>`).join('')}</div>
        <div class="pf backside"><div class="chk">${ic('check', 30)}</div><b>Termin bestätigt</b><p>${s.name}</p><p>${UI.dLong(d)}, ${UI.hhmm(V.time)} Uhr</p><p>Bestätigung und Erinnerung kommen per E-Mail.</p></div>
      </div></div>
      <div class="push"><button type="button" class="btn ghost block" data-act="restart">Noch einen Weg ausprobieren</button><p class="fine">Vorschau. Es wurde kein Termin gebucht.</p></div>`;
  }
};
function two(q, sub, opts){
  return `<h2 class="q">${q}</h2><p class="sub">${sub}</p>${UI.list(opts.map(([id, l]) => ({label:l, meta:'ca. ' + SV[id].min + ' Min.', attrs:`data-svc="${id}"`})))}`;
}

function render(mode){
  clearTimeout(flipTimer);
  UI.swap(body, STEPS[V.step](), mode);
  backBtn.classList.toggle('off', !H.length || V.step === 'fertig');
  const p = path(), idx = V.step === 'fertig' ? p.length : Math.max(0, p.indexOf(V.step));
  UI.progress(prog, p.length, idx);
  renderSum(); renderTech();
  // nach dem Buchen: Bestätigung als Nachricht auf dem iPhone; Linsen-Termine (Betreuung, Kind-Kontrolle) mit Hinweis „Linsen tragen“
  const ios = root.querySelector('.ios');
  if (V.step !== 'fertig') { if (ios) ios.remove(); }
  else if (!ios) { const s = svc(), d = UI.days()[V.day]; UI.sms(root, {name:s.name, date:UI.dLong(d), time:UI.hhmm(V.time), min:s.min, prep:s.prep, wear:s.g === 'b' || V.svc === 'kind-kontrolle', kid:V.svc === 'kind-kontrolle'}, () => { V = fresh(); H = []; render('back'); }); }
}
function renderSum(){
  const s = svc();
  sumEl.classList.toggle('set', !!V.topic);
  const txt = s ? s.name.replace('Erstanpassung · ', '').replace(' (Folgeversorgung)', '') + ' · ' + s.min + ' Min.' : V.topic ? TOPICS[V.topic].label : 'Hier entsteht Ihr Termin-Pass';
  sumEl.innerHTML = `${ic('ticket', 18)}<span class="tx">${txt}</span>${V.topic && V.step !== 'fertig' ? '<button type="button" data-sum>ändern</button>' : ''}`;
}
function renderTech(){
  if (techEl.hidden) return;
  const s = svc();
  if (!s) { techEl.innerHTML = '<h4>Übergabe an Timify</h4><p>Noch keine Leistung gewählt. Mit jeder Antwort wird der Weg enger.</p>'; return; }
  const lines = [`data-service-external-ids="${s.id}"`];
  if (V.age) lines.push(`data-ext-customer-field-1="altersgruppe-${V.age === '40' ? '40+' : '12-39'}"`);
  if (V.vo) lines.push(`data-ext-customer-field-2="verordnung-${V.vo}"`);
  lines.push('data-meta-utmsource="terminfinder"');
  techEl.innerHTML = `<h4>Übergabe an Timify</h4><dl class="kv"><dt>Leistung</dt><dd>${s.name}</dd><dt>Dauer</dt><dd>${s.min} Min.${s.is40 ? ` statt ${SV[V.svc].min}` : ''} · Beispiel</dd><dt>Team</dt><dd>${s.wer} · Beispiel</dd></dl><pre class="code">${lines.join('\n')}</pre>`;
}
function go(mut, mode){ H.push(JSON.stringify(V)); mut(); render(mode); }
function choice(el, mut){ lock = true; UI.pick(el, () => { lock = false; go(mut); }); }
function updRes(){
  const r = body.querySelector('#vRes'); if (r) r.innerHTML = resHTML();
  const c = body.querySelector('[data-act="clear"]'); if (c) c.classList.toggle('off', !V.q);
}

body.addEventListener('click', e => {
  if (lock) return;
  let el;
  if ((el = e.target.closest('[data-topic]'))) return choice(el, () => { V.topic = el.dataset.topic; V.step = TOPICS[V.topic].step; V.q = ''; });
  if ((el = e.target.closest('[data-svc]'))) return choice(el, () => pickSvc(el.dataset.svc));
  if ((el = e.target.closest('[data-wish]'))) return choice(el, () => { V.wish = el.dataset.wish; V.age = null; if (V.wish === 'ea-gleit') { V.svc = V.wish; toTermin(); } else V.step = 'alter'; });
  if ((el = e.target.closest('[data-age]'))) return choice(el, () => { V.age = el.dataset.age; V.svc = V.wish; toTermin(); });
  if ((el = e.target.closest('[data-jump]'))) return go(() => { const k = el.dataset.jump; Object.assign(V, {topic:k, step:TOPICS[k].step, wish:null, age:null, svc:null, day:null, time:null, vo:null}); });
  if (V.step === 'termin' && UI.calClick(e, V)) return render('still');
  if ((el = e.target.closest('[data-vo]'))) { V.vo = el.dataset.vo; return render('still'); }
  if (!(el = e.target.closest('[data-act]'))) return;
  const a = el.dataset.act;
  if (a === 'clear') { V.q = ''; const inp = body.querySelector('#vSearch'); inp.value = ''; updRes(); inp.focus(); }
  else if (a === 'next' && V.time !== null) go(() => { V.step = 'daten'; });
  else if (a === 'book') go(() => { V.step = 'fertig'; });
  else if (a === 'flip') { clearTimeout(flipTimer); body.querySelector('.pass-in').classList.toggle('flip'); }
  else if (a === 'restart') { V = fresh(); H = []; render('back'); }
});
body.addEventListener('input', e => { if (e.target.id === 'vSearch') { V.q = e.target.value; updRes(); } });
body.addEventListener('keydown', e => {
  if (e.target.id === 'vSearch' && e.key === 'Enter') { const f = find(V.q)[0]; if (f) { e.preventDefault(); e.target.blur(); go(() => pickSvc(f)); } }
  if (e.target.matches('[data-act="flip"]') && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); clearTimeout(flipTimer); e.target.querySelector('.pass-in').classList.toggle('flip'); }
});
sumEl.addEventListener('click', e => {
  if (!e.target.closest('[data-sum]')) return;
  go(() => {
    if (V.svc || V.wish) Object.assign(V, {step:TOPICS[V.topic].step, wish:null, age:null, svc:null, day:null, time:null, vo:null});
    else V = fresh();
  }, 'back');
});
backBtn.innerHTML = ic('chevron-left', 20);
backBtn.addEventListener('click', () => { if (H.length) { V = JSON.parse(H.pop()); render('back'); } });
techBtn.addEventListener('click', () => { techEl.hidden = !techEl.hidden; techBtn.setAttribute('aria-pressed', String(!techEl.hidden)); renderTech(); });

// Links „Direkt von Ihren Leistungsseiten“ öffnen diesen Terminfinder im passenden Schritt
document.querySelectorAll('[data-vb]').forEach(b => b.addEventListener('click', () => {
  const [kind, val] = b.dataset.vb.split(':');
  V = fresh(); H = [];
  if (kind === 'topic') { V.topic = val; V.step = TOPICS[val].step; } else pickSvc(val);
  render();
  if (window.CAR) CAR.show(0, false);
  document.getElementById('ausprobieren').scrollIntoView({behavior:UI.reduced() ? 'auto' : 'smooth', block:'start'});
}));

// Leistungskatalog für Timify aus denselben Daten
const cat = document.getElementById('vCatalog');
if (cat) cat.innerHTML = `<thead><tr><th scope="col">Leistung</th><th scope="col">Min.</th><th scope="col">Team</th><th scope="col">Externe ID</th></tr></thead><tbody>${['b','e','m','k','r'].map(g => `<tr class="grp"><td colspan="4">${GR[g]}</td></tr>` + Object.keys(SV).filter(id => SV[id].g === g).map(id => {
  const s = SV[id];
  return `<tr><td>${s.name}${s.vor ? '<span class="tag">Vorschlag</span>' : ''}</td><td class="n">${s.min}${s.min40 ? `<small>ab 40: ${s.min40}</small>` : ''}</td><td>${s.wer}</td><td><code>${id}</code>${s.min40 ? `<br><code>${id}-40</code>` : ''}</td></tr>`;
}).join('')).join('')}</tbody>`;

render('still');
})();
