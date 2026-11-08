const $ = (id) => document.getElementById(id);
const form = $('form');
let reportText = '';
const LEVELS = { attention: 'Point à traiter relevé lors de l’inspection.', monitor: 'Un élément est à surveiller lors d’un prochain contrôle.', ok: 'Aucun point particulier n’a été relevé dans les éléments inspectés.' };

function renderReport() {
  const customer = $('customer').value.trim() || 'Madame, Monsieur';
  const vehicle = $('vehicle').value.trim() || 'votre véhicule';
  const plate = $('plate').value.trim();
  const date = $('date').value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${$('date').value}T12:00:00`)) : '';
  const observations = $('observations').value.trim();
  const recommendation = $('recommendation').value.trim();
  const level = $('level').value;
  $('outIntro').textContent = `Bonjour ${customer}, voici le compte rendu de l’inspection visuelle de ${vehicle}${plate ? ` (${plate})` : ''}${date ? ` réalisée le ${date}` : ''}.`;
  $('outObs').textContent = observations || 'Les observations apparaîtront ici.';
  $('outObs').classList.toggle('placeholder', !observations);
  $('outStatus').textContent = LEVELS[level];
  $('recWrap').hidden = !recommendation;
  $('outRec').textContent = recommendation;
  reportText = `${$('outIntro').textContent}\n\nÉLÉMENTS OBSERVÉS\n${observations}\n\n${LEVELS[level]}${recommendation ? `\n\nCONSEIL DU GARAGE\n${recommendation}` : ''}\n\nCe compte rendu reprend les observations saisies par le mécanicien. Il ne remplace pas un diagnostic complet ni une vérification des éléments non inspectés.\n\nVotre garage`;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  renderReport();
  $('copy').disabled = false;
  $('print').disabled = false;
});
$('copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(reportText); $('copy').textContent = 'Copié !'; }
  catch { $('copy').textContent = 'Sélectionnez le texte pour le copier'; }
});
$('print').addEventListener('click', () => window.print());
const today = new Date();
$('date').value = [today.getFullYear(), String(today.getMonth()+1).padStart(2,'0'), String(today.getDate()).padStart(2,'0')].join('-');
