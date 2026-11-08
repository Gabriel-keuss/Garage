const $ = (id) => document.getElementById(id);
let reportText = '';

function entries(value) { return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean); }
function setList(id, countId, values) {
  const text = values.length ? values.map((value) => `• ${value}`).join('\n') : 'Aucune entrée renseignée.';
  $(id).textContent = text;
  $(id).classList.toggle('placeholder', !values.length);
  $(countId).textContent = String(values.length);
}
function generate() {
  const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${$('date').value}T12:00:00`));
  const done = entries($('done').value);
  const pending = entries($('pending').value);
  const callbacks = entries($('callbacks').value);
  const note = $('note').value.trim();
  $('outDate').textContent = date;
  setList('outDone', 'doneCount', done);
  setList('outPending', 'pendingCount', pending);
  setList('outCallbacks', 'callbackCount', callbacks);
  $('noteWrap').hidden = !note;
  $('outNote').textContent = note;
  reportText = `GARAGE-PROJET — CLÔTURE DE JOURNÉE\n${date}\n\nINTERVENTIONS TERMINÉES (${done.length})\n${done.length ? done.map((x) => `• ${x}`).join('\n') : 'Aucune entrée renseignée.'}\n\nÀ POURSUIVRE / EN ATTENTE (${pending.length})\n${pending.length ? pending.map((x) => `• ${x}`).join('\n') : 'Aucune entrée renseignée.'}\n\nCLIENTS À RAPPELER (${callbacks.length})\n${callbacks.length ? callbacks.map((x) => `• ${x}`).join('\n') : 'Aucune entrée renseignée.'}${note ? `\n\nNOTE POUR L’ÉQUIPE\n${note}` : ''}`;
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault();
  generate();
  $('copy').disabled = false;
  $('print').disabled = false;
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(reportText); $('copy').textContent = 'Copié !'; }
  catch { $('copy').textContent = 'Sélectionnez le texte pour le copier'; }
});
$('print').addEventListener('click', () => window.print());
$('date').value = new Date().toISOString().slice(0,10);
