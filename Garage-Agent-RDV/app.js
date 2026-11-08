const conversation = document.querySelector('#conversation');
const form = document.querySelector('#reply-form');
const input = document.querySelector('#reply');

const questions = [
  { key: 'name', text: 'Pour commencer, quel est votre nom et prénom ?' },
  { key: 'contact', text: 'Quel numéro de téléphone ou quelle adresse e-mail le garage peut-il utiliser pour vous répondre ?' },
  { key: 'vehicle', text: 'Quel est le véhicule concerné ? Indiquez la marque et le modèle, et l’année si vous la connaissez.' },
  { key: 'reason', text: 'Quel service souhaitez-vous ? Décrivez le problème ou le motif du rendez-vous.' },
  { key: 'availability', text: 'Quelles sont vos disponibilités ? Vous pouvez donner un ou plusieurs jours et moments qui vous conviennent.' }
];
let answers = {};
let step = 0;

function addBubble(text, type = 'bot') {
  const el = document.createElement('div');
  el.className = `bubble ${type}`;
  el.textContent = text;
  conversation.append(el);
  conversation.scrollTop = conversation.scrollHeight;
  return el;
}
function ask() {
  if (step < questions.length) {
    addBubble(questions[step].text);
    input.focus();
  } else showSummary();
}
function showSummary() {
  addBubble('Merci, j’ai toutes les informations pour préparer la demande. Voici le récapitulatif à transmettre au garage :');
  const card = document.createElement('div');
  card.className = 'summary';
  const labels = [['name','Client'],['contact','Contact'],['vehicle','Véhicule'],['reason','Motif'],['availability','Disponibilités']];
  card.innerHTML = `<strong>DEMANDE DE RENDEZ-VOUS</strong><br>${labels.map(([key,label]) => `<b>${label} :</b> ${escapeHtml(answers[key])}`).join('<br>')}<br><b>Statut :</b> en attente de confirmation du garage`;
  conversation.append(card);
  const actions = document.createElement('div');
  actions.className = 'summary-actions';
  const copy = document.createElement('button');
  copy.textContent = 'Copier le récapitulatif';
  copy.onclick = async () => {
    try { await navigator.clipboard.writeText(summaryText()); copy.textContent = 'Copié !'; }
    catch { copy.textContent = 'Copie indisponible'; }
  };
  const email = document.createElement('button');
  email.textContent = 'Préparer un e-mail';
  email.onclick = () => { location.href = `mailto:?subject=${encodeURIComponent('Demande de rendez-vous garage')}&body=${encodeURIComponent(summaryText())}`; };
  actions.append(copy, email); conversation.append(actions);
  input.disabled = true; form.querySelector('button').disabled = true;
  conversation.scrollTop = conversation.scrollHeight;
}
function summaryText() {
  return `DEMANDE DE RENDEZ-VOUS\nClient : ${answers.name}\nContact : ${answers.contact}\nVéhicule : ${answers.vehicle}\nMotif : ${answers.reason}\nDisponibilités : ${answers.availability}\nStatut : en attente de confirmation du garage`;
}
function escapeHtml(value) { return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function reset() { answers = {}; step = 0; conversation.replaceChildren(); input.disabled = false; form.querySelector('button').disabled = false; ask(); }
form.addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value || step >= questions.length) return;
  addBubble(value, 'user');
  answers[questions[step].key] = value;
  input.value = '';
  step++;
  window.setTimeout(ask, 250);
});
document.querySelector('#reset').addEventListener('click', reset);
ask();
