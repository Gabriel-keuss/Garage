const $ = (id) => document.getElementById(id);
const form = $('reminder-form');
const output = $('output');
const copyButton = $('copy');
const emailButton = $('email');
let currentMessage = '';

const SERVICES = {
  revision: 'la révision ou la vidange',
  tires: 'le changement de pneus',
  inspection: 'le contrôle technique',
  other: 'l’entretien de votre véhicule',
};

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(
    new Date(`${value}T12:00:00`),
  );
}

function createMessage(data) {
  const service = SERVICES[data.service] || SERVICES.other;
  let message = `Bonjour ${data.client},\n\nNous vous contactons au sujet de votre ${data.vehicle}. ${service} approche et nous vous invitons à prévoir un rendez-vous avec le garage.`;

  if (data.date) message += `\n\nÉchéance prévue : ${formatDate(data.date)}.`;
  if (data.mileage.trim()) message += `\nKilométrage indicatif : ${data.mileage.trim()}.`;
  if (data.detail.trim()) message += `\n\n${data.detail.trim()}`;

  message += '\n\nN’hésitez pas à nous contacter pour choisir un créneau.\n\nÀ bientôt,\nVotre garage';
  return message;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  currentMessage = createMessage(data);
  output.textContent = currentMessage;
  output.classList.remove('placeholder');
  copyButton.disabled = false;
  emailButton.disabled = false;
  $('notice').textContent = 'Vérifiez les informations et personnalisez le message avant l’envoi.';
});

copyButton.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(currentMessage);
    $('notice').textContent = 'Message copié. Vous pouvez le coller dans votre SMS ou votre messagerie.';
  } catch {
    $('notice').textContent = 'La copie automatique est indisponible. Sélectionnez le texte pour le copier.';
  }
});

emailButton.addEventListener('click', () => {
  const subject = 'Rappel d’entretien de votre véhicule';
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(currentMessage)}`;
});
