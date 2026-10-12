// Variante 1 – genau nach der Skizze von Wörle.Optik
(() => {
const FLOW = {
  start:{ q:'Waren Sie schon einmal bei uns?', sub:'Damit wir Ihnen die passende Terminart vorschlagen.', tree:'Schon einmal hier?', opts:[
    {key:'ja', label:'Ja, ich war schon bei Ihnen', sub:'Kontaktlinsen oder Brille', icon:'refresh-cw', next:'stamm', short:'Stammkunde'},
    {key:'nein', label:'Nein, ich bin zum ersten Mal hier', sub:'Wir freuen uns, Sie kennenzulernen', icon:'user-plus', next:'neu', short:'Neukunde'} ]},
  stamm:{ q:'Was steht bei Ihnen an?', tree:'Was steht an?', other:true, opts:[
    {key:'nk-baby', group:'Nachkontrolle', label:'Baby oder Kleinkind', end:'st-nk-baby'},
    {key:'nk-hart', group:'Nachkontrolle', label:'Harte Linsen', end:'st-nk-hart'},
    {key:'nk-weich', group:'Nachkontrolle', label:'Weiche Linsen', end:'st-nk-weich'},
    {key:'fv-hart', group:'Folgeversorgung (neue Linsen)', label:'Harte Linsen', end:'st-fv-hart'},
    {key:'fv-weich', group:'Folgeversorgung (neue Linsen)', label:'Weiche Linsen', end:'st-fv-weich'},
    {key:'fv-skl', group:'Folgeversorgung (neue Linsen)', label:'Sklerallinsen', end:'st-fv-skl'},
    {key:'brille', group:'Brille', label:'Sehtest oder neue Brille', end:'st-brille', short:'Brille'} ]},
  neu:{ q:'Worum geht es?', sub:'Wählen Sie, was am besten passt.', tree:'Worum geht es?', opts:[
    {key:'kl', label:'Ich möchte Kontaktlinsen', sub:'Tageslinsen, harte Linsen, Gleitsicht, Sport', icon:'kl-lens', next:'alter', short:'Kontaktlinsen'},
    {key:'br', label:'Ich brauche eine Brille', sub:'Beratung und Sehtest', icon:'glasses', end:'neu-brille', short:'Brille'},
    {key:'med', label:'Medizinischer Grund', sub:'z. B. Keratokonus, nach OP oder Verletzung', icon:'eye-med', next:'med', short:'Medizinisch'},
    {key:'baby', label:'Für mein Baby oder Kleinkind', sub:'Kontaktlinsen für die Kleinsten', icon:'baby', end:'neu-baby', short:'Baby/Kleinkind'} ]},
  alter:{ q:'Wie alt sind Sie?', sub:'Ab etwa 40 lässt das Sehen in der Nähe nach. Dann planen wir mehr Zeit ein.', tree:'Alter', opts:[
    {key:'u40', label:'12 bis 39 Jahre', age:'u40', next:'wunsch', short:'12–39'},
    {key:'ue40', label:'40 Jahre oder älter', sub:'mit Prüfung fürs Sehen in der Nähe', age:'ue40', next:'wunsch', short:'40+'} ]},
  wunsch:{ q:'Was wünschen Sie sich?', sub:'Wenn Sie unsicher sind, beraten wir Sie im Termin.', tree:'Wunsch', opts:[
    {key:'sport', label:'Linsen für ab und zu', sub:'z. B. für den Sport', icon:'dumbbell', end:'neu-kl-sport'},
    {key:'tag', label:'Tageslinsen', sub:'jeden Tag frisch, ohne Pflegemittel', icon:'sun', end:'neu-kl-tag'},
    {key:'hart', label:'Harte Linsen', sub:'formstabil, individuell angepasst', icon:'kl-new', end:'neu-kl-hart'},
    {key:'gleit', label:'Gleitsichtlinsen', sub:'scharf in der Nähe und in der Ferne', icon:'book-open', end:'neu-kl-gleit'} ]},
  med:{ q:'Worum geht es genau?', sub:'Haben Sie eine ärztliche Verordnung? Bringen Sie sie einfach mit.', tree:'Medizinischer Grund', opts:[
    {key:'kk', label:'Keratokonus', icon:'keratokonus', end:'neu-kk'},
    {key:'op', label:'Nach Transplantation, Verletzung oder Laser-OP', icon:'bandage', end:'neu-op', short:'Transplantat/Verletzung/Laser'},
    {key:'skl', label:'Sklerallinsen', icon:'kl-lens', end:'neu-skl'},
    {key:'iris', label:'Irislinse', sub:'z. B. nach einer Verletzung', icon:'iris', end:'neu-iris'} ]}
};
// Terminarten in Timify – Dauer, Team und Hinweis sind Beispiele; p40 = eigene Terminart ab 40
const READ = ' Falls Sie eine Lesebrille haben, bringen Sie sie bitte auch mit.';
const LENS = 'Bringen Sie Ihre Brille und, falls vorhanden, Ihren Brillenpass mit.';
const T = {
  'st-nk-baby': {name:'Nachkontrolle Baby/Kleinkind', min:30, wer:'Kinder-Kontaktlinsen', prep:'Bitte bringen Sie die Linsen Ihres Kindes und den Behälter mit.'},
  'st-nk-hart': {name:'Nachkontrolle harte Linsen', min:20, wer:'Kontaktlinsen-Team', prep:'Bitte tragen Sie Ihre Linsen zum Termin und bringen Sie den Behälter mit.'},
  'st-nk-weich':{name:'Nachkontrolle weiche Linsen', min:20, wer:'Kontaktlinsen-Team', prep:'Bitte tragen Sie Ihre Linsen zum Termin und bringen Sie den Behälter mit.'},
  'st-fv-hart': {name:'Folgeversorgung harte Linsen', min:30, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie Ihre aktuellen Linsen und Ihren Linsenpass mit.'},
  'st-fv-weich':{name:'Folgeversorgung weiche Linsen', min:30, wer:'Kontaktlinsen-Team', prep:'Bitte bringen Sie Ihre aktuellen Linsen und Ihren Linsenpass mit.'},
  'st-fv-skl':  {name:'Folgeversorgung Sklerallinsen', min:45, wer:'Spezialist/in Sklerallinsen', prep:'Bitte bringen Sie Ihre aktuellen Sklerallinsen und den Behälter mit.'},
  'st-brille':  {name:'Sehtest und Brillenberatung (Stammkunde)', min:30, wer:'Brillen-Team', prep:'Bringen Sie Ihre aktuelle Brille mit.'},
  'neu-brille': {name:'Brillenberatung mit Sehtest', min:45, wer:'Brillen-Team', prep:'Bringen Sie Ihre aktuelle Brille mit, falls Sie eine haben.'},
  'neu-baby':   {name:'Erstversorgung Baby/Kleinkind', min:90, wer:'Kinder-Kontaktlinsen', prep:'Bitte bringen Sie alle Befunde der Augenklinik oder des Augenarztes mit.'},
  'neu-kl-sport':{name:'Kontaktlinsen-Erstanpassung · für ab und zu', min:45, p40:60, wer:'Kontaktlinsen-Team', prep:LENS},
  'neu-kl-tag': {name:'Kontaktlinsen-Erstanpassung · Tageslinsen', min:45, p40:60, wer:'Kontaktlinsen-Team', prep:LENS},
  'neu-kl-hart':{name:'Kontaktlinsen-Erstanpassung · harte Linsen', min:60, p40:75, wer:'Kontaktlinsen-Team', prep:LENS},
  'neu-kl-gleit':{name:'Kontaktlinsen-Erstanpassung · Gleitsicht', min:75, p40:75, wer:'Kontaktlinsen-Team', prep:LENS},
  'neu-kk':     {name:'Erstberatung Keratokonus', min:90, wer:'Spezialist/in Keratokonus', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und vorhandene Befunde (z. B. Topographie) mit.'},
  'neu-op':     {name:'Erstberatung nach OP oder Verletzung', min:90, wer:'Spezialist/in Kontaktlinseninstitut', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und den OP- oder Klinikbericht mit.'},
  'neu-skl':    {name:'Erstanpassung Sklerallinsen', min:90, wer:'Spezialist/in Sklerallinsen', prep:'Bitte bringen Sie Ihre ärztliche Verordnung und vorhandene Befunde mit.'},
  'neu-iris':   {name:'Beratung Irislinse', min:60, wer:'Spezialist/in Kontaktlinseninstitut', prep:'Bitte bringen Sie vorhandene Befunde und, falls möglich, ein Foto Ihres anderen Auges mit.'}
};
const REST = {start:3, neu:2, alter:1, wunsch:0, stamm:0, med:0};

const root = document.getElementById('fa');
const body = root.querySelector('.ph-body'), prog = root.querySelector('.ph-prog'), backBtn = root.querySelector('.ph-back'), techBtn = root.querySelector('.ph-tech');
const techEl = document.getElementById('faTech'), treeEl = document.getElementById('faTree');
const fresh = () => ({node:'start', stage:'q', ans:[], age:null, termin:null, day:null, time:null, more:false, part:'alle'});
let S = fresh(), hist = [], lock = false;
const snap = () => JSON.parse(JSON.stringify(S));

function term(){
  const t = T[S.termin];
  if (S.age === 'ue40' && t.p40) return Object.assign({}, t, {min:t.p40, name:t.name + ' (ab 40)', prep:t.prep + READ, is40:true});
  return t;
}
function opts(id, forTree){
  const list = FLOW[id].opts.slice();
  if (id === 'wunsch' && !forTree && S.age === 'ue40') {
    const i = list.findIndex(o => o.key === 'gleit');
    const g = Object.assign({}, list[i], {tag:'häufig ab 40'}); list.splice(i, 1); list.unshift(g);
  }
  return list;
}
function choose(id, key){
  const o = opts(id).find(x => x.key === key);
  hist.push(snap());
  S.ans.push({node:id, key, label:o.short || o.label});
  if (o.age) S.age = o.age;
  if (o.end) {
    S.termin = o.end; S.stage = 'cal'; S.more = false; S.part = 'alle'; S.time = null;
    const f = UI.first(term().min, 1)[0]; S.day = f ? f.day : 0;
  } else S.node = o.next;
  render();
}

const mins = e => 'ca. ' + (S.age === 'ue40' && T[e].p40 ? T[e].p40 : T[e].min) + ' Min.';
const toRow = o => ({label:o.label, sub:o.sub, icon:o.icon, tag:o.tag, meta:o.end ? mins(o.end) : '', attrs:`data-node="${S.node}" data-key="${o.key}"`});
function qHTML(){
  const n = FLOW[S.node], list = opts(S.node);
  let h = `<h2 class="q">${n.q}</h2>${n.sub ? `<p class="sub">${n.sub}</p>` : '<div style="height:10px"></div>'}`;
  if (list.some(o => o.group)) h += [...new Set(list.map(o => o.group))].map(g => `<p class="lh">${g}</p>` + UI.list(list.filter(o => o.group === g).map(toRow))).join('');
  else h += UI.list(list.map(toRow));
  if (n.other) h += `<p class="hint">${ic('info', 16)}<span>Etwas anderes? Hier steht später Ihre Telefonnummer.</span></p>`;
  if (S.node === 'start') h += '<div class="push"><p class="fine">Dauert unter einer Minute · keine Anmeldung nötig</p></div>';
  return h;
}
function calHTML(){
  const t = term();
  return `<p class="kicker">Kalender</p><h2 class="q">Wann passt es Ihnen?</h2><p class="sub">${t.name} · ca. ${t.min} Minuten</p>${UI.cal(S, t.min)}
    <div class="push"><button type="button" class="btn block" data-act="next" ${S.time === null ? 'disabled' : ''}>Weiter</button></div>`;
}
function formHTML(){
  const d = UI.days()[S.day];
  return `<p class="kicker">Ihre Angaben</p><h2 class="q">Fast geschafft</h2><p class="sub">${UI.dLong(d)}, ${UI.hhmm(S.time)} Uhr</p>
    <div class="ff"><span>Vor- und Nachname</span><i>Feld in Timify</i></div>
    <div class="ff"><span>E-Mail</span><i>Feld in Timify</i></div>
    <div class="ff"><span>Telefon (optional)</span><i>Feld in Timify</i></div>
    <div class="push"><button type="button" class="btn block" data-act="book">Termin buchen (Vorschau)</button><p class="fine">In der Vorschau wird nichts gesendet oder gebucht.</p></div>`;
}
function doneHTML(){
  const t = term(), d = UI.days()[S.day];
  return `<div class="done-ic">${ic('check', 28)}</div><h2 class="q">So sieht die Bestätigung aus</h2><p class="sub">Timify schickt sie per E-Mail und erinnert vor dem Termin.</p>
    <ul class="sum"><li>${ic('calendar', 18)}<span><b>${t.name}</b></span></li><li>${ic('clock', 18)}<span>${UI.dLong(d)}, ${UI.hhmm(S.time)} Uhr · ca. ${t.min} Minuten</span></li><li>${ic('mail', 18)}<span>Bestätigung und Erinnerung per E-Mail oder SMS</span></li></ul>
    <div class="prep"><b>Bitte mitbringen:</b> ${t.prep}</div>
    <div class="push"><button type="button" class="btn ghost block" data-act="restart">Anderen Weg ausprobieren</button><p class="fine">Vorschau. Es wurde kein Termin gebucht.</p></div>`;
}

function render(mode){
  UI.swap(body, S.stage === 'q' ? qHTML() : S.stage === 'cal' ? calHTML() : S.stage === 'form' ? formHTML() : doneHTML(), mode);
  backBtn.classList.toggle('off', !hist.length || S.stage === 'done');
  const fwd = S.stage === 'form' ? 1 : S.stage === 'done' ? 2 : 0;
  UI.progress(prog, S.ans.length + (S.stage === 'q' ? REST[S.node] + 1 : 0) + 2, S.ans.length + fwd);
  renderTech();
  if (treeEl) treeEl.innerHTML = tree('start');
}
function renderTech(){
  if (techEl.hidden) return;
  let h = `<h4>Was im Hintergrund passiert</h4><dl class="kv"><dt>Antworten</dt><dd>${S.ans.map(a => a.label).join(' › ') || '–'}</dd>`;
  if (S.termin) {
    const t = term(), base = T[S.termin];
    h += `<dt>Terminart</dt><dd>${t.name}</dd><dt>Dauer</dt><dd>${t.min} Min.${t.is40 && base.p40 !== base.min ? ` statt ${base.min}` : ''} · Beispiel</dd><dt>Team</dt><dd>${t.wer} · Beispiel</dd><dt>Hinweis</dt><dd style="font-weight:500">${t.prep}</dd>`;
  } else h += '<dt>Terminart</dt><dd style="font-weight:500">Noch offen. Mit jeder Antwort wird der Weg enger.</dd>';
  h += '</dl>';
  if (S.node === 'alter' || S.age) h += '<p class="why-t"><b>Warum das Alter?</b> Ab etwa 40 beginnt die Alterssichtigkeit. Mit der Altersangabe bucht Timify automatisch die längere Anpassung.</p>';
  techEl.innerHTML = h;
}
function tree(id){
  const n = FLOW[id], on = new Set(S.ans.map(a => a.node + ':' + a.key)), list = opts(id, true);
  const same = list.length > 1 && list.every(o => o.next && o.next === list[0].next);
  const li = o => {
    const isOn = on.has(id + ':' + o.key), cur = isOn && o.end && o.end === S.termin, t = o.end ? T[o.end] : null;
    const lb = o.group && o.key !== 'brille' ? o.group.split(' ')[0] + ': ' + o.label : (o.short || o.label);
    return `<li class="${cur ? 'cur' : isOn ? 'on' : ''}"><span class="lb">${lb}</span>${t ? ` <span class="lf">→ ${t.name} · ${t.min}${t.p40 && t.p40 !== t.min ? '/' + t.p40 : ''} Min.</span>` : ''}${o.next && !same ? `<ul>${tree(o.next)}</ul>` : ''}</li>`;
  };
  let h = `<li><span class="ql">${n.tree}</span></li>` + list.map(li).join('');
  if (same) h += `<li><ul>${tree(list[0].next)}</ul></li>`;
  return h;
}

body.addEventListener('click', e => {
  if (lock) return;
  const o = e.target.closest('[data-key]');
  if (o) { lock = true; return UI.pick(o, () => { lock = false; choose(o.dataset.node, o.dataset.key); }); }
  if (S.stage === 'cal' && UI.calClick(e, S)) return render('still');
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.dataset.act === 'next' && S.time !== null) { hist.push(snap()); S.stage = 'form'; render(); }
  else if (a.dataset.act === 'book') { hist.push(snap()); S.stage = 'done'; render(); }
  else if (a.dataset.act === 'restart') { S = fresh(); hist = []; render('back'); }
});
backBtn.innerHTML = ic('chevron-left', 20);
backBtn.addEventListener('click', () => { if (hist.length) { S = hist.pop(); render('back'); } });
techBtn.addEventListener('click', () => { techEl.hidden = !techEl.hidden; techBtn.setAttribute('aria-pressed', String(!techEl.hidden)); renderTech(); });
render('still');
})();
