const $ = (id) => document.getElementById(id);
const form = $('message-form');
const status = $('status');
const approvalFields = $('approval-fields');
const output = $('output');
const copyButton = $('copy');
const emailButton = $('email');
let currentMessage = '';

const euro = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

function updateConditionalFields() {
  approvalFields.hidden = status.value !== 'approval';
}

function createMessage(data) {
  const greeting = `Bonjour ${data.client},`;
  const car = `votre ${data.vehicle}`;
  let message;

  if (data.status === 'diagnostic') {
    message = `${greeting}\n\nNous vous informons que le diagnostic de ${car} est en cours. Nous vous tiendrons au courant dès que nous aurons plus d’informations.`;
    if (data.detail) message += `\n\n${data.detail}`;
  } else if (data.status === 'approval') {
    const work = data.work || 'les travaux proposés';
    const estimate = data.estimate ? ` Le montant du devis est de ${euro(Number(data.estimate))}.` : '';
    message = `${greeting}\n\nAprès diagnostic de ${car}, nous vous proposons : ${work}.${estimate}\n\nMerci de nous confirmer si vous nous autorisez à effectuer ces travaux. Nous attendrons votre accord avant de poursuivre.`;
    if (data.detail) message += `\n\n${data.detail}`;
  } else {
    message = `${greeting}\n\nLa réparation de ${car} est terminée. Votre véhicule est prêt. Contactez le garage pour convenir de son retrait.`;
    if (data.detail) message += `\n\n${data.detail}`;
  }

  message += '\n\nÀ bientôt,\nVotre garage';
  return message;
}

status.addEventListener('change', updateConditionalFields);

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
  const subject = 'Nouvelles concernant votre véhicule';
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(currentMessage)}`;
});

updateConditionalFields();
