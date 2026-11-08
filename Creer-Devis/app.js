const $ = (id) => document.getElementById(id);
const lines = $('lines');

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function addLine(description = '', quantity = 1, unitPrice = '', type = 'Pièce') {
  const row = document.createElement('div');
  row.className = 'line-row';
  row.innerHTML = `
    <label>Désignation<input class="line-description" placeholder="Pièce ou prestation" value="${escapeHtml(description)}"></label>
    <label>Qté<input class="line-quantity" type="number" min="0.01" step="0.01" value="${quantity}"></label>
    <label>Prix HT (€)<input class="line-price" type="number" min="0" step="0.01" placeholder="0,00" value="${unitPrice}"></label>
    <button class="remove-line" type="button" aria-label="Supprimer cette ligne" title="Supprimer">×</button>`;
  row.dataset.type = type;
  row.querySelectorAll('input').forEach((input) => input.addEventListener('input', updatePreview));
  row.querySelector('.remove-line').addEventListener('click', () => {
    row.remove();
    updatePreview();
  });
  lines.append(row);
  updatePreview();
}

function getLineData() {
  return [...lines.querySelectorAll('.line-row')].map((row) => ({
    description: row.querySelector('.line-description').value.trim(),
    quantity: Number(row.querySelector('.line-quantity').value) || 0,
    unitPrice: Number(row.querySelector('.line-price').value) || 0,
  }));
}

function formatMoney(value) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));
}

function updatePreview() {
  $('outGarage').textContent = $('garage').value.trim() || 'Nom du garage';
  $('outGarageContact').textContent = $('garageContact').value.trim() || 'Coordonnées du garage';
  $('outCustomer').textContent = $('customer').value.trim() || 'Nom du client';
  $('outCustomerContact').textContent = $('customerContact').value.trim();
  $('outVehicle').textContent = $('vehicle').value.trim() || 'Véhicule';
  $('outRegistration').textContent = $('registration').value.trim() ? `Immatriculation : ${$('registration').value.trim()}` : '';
  $('outDate').textContent = $('quoteDate').value ? `Date : ${formatDate($('quoteDate').value)}` : '';
  $('outValidity').textContent = $('validUntil').value ? `Valable jusqu’au : ${formatDate($('validUntil').value)}` : '';

  const tbody = $('outLines');
  tbody.replaceChildren();
  let totalHT = 0;

  for (const item of getLineData()) {
    if (!item.description && !item.unitPrice) continue;
    const amount = item.quantity * item.unitPrice;
    totalHT += amount;
    const row = document.createElement('tr');
    for (const value of [item.description || 'Prestation', item.quantity.toLocaleString('fr-FR'), formatMoney(item.unitPrice), formatMoney(amount)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    tbody.append(row);
  }

  if (!tbody.children.length) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 4;
    cell.textContent = 'Ajoutez les pièces et prestations';
    cell.className = 'muted';
    row.append(cell);
    tbody.append(row);
  }

  const rate = Number($('vat').value) || 0;
  const vat = totalHT * rate / 100;
  $('outHT').textContent = formatMoney(totalHT);
  $('outVatRate').textContent = String(rate).replace('.', ',');
  $('outVat').textContent = formatMoney(vat);
  $('outTTC').textContent = formatMoney(totalHT + vat);
  $('outNotes').textContent = $('notes').value.trim();
  $('outNotesWrap').hidden = !$('notes').value.trim();
}

document.querySelectorAll('.editor input, .editor textarea, .editor select').forEach((input) => {
  input.addEventListener('input', updatePreview);
  input.addEventListener('change', updatePreview);
});

$('addLine').addEventListener('click', () => addLine());
$('print').addEventListener('click', () => window.print());
$('reset').addEventListener('click', () => {
  if (!window.confirm('Effacer toutes les informations saisies ?')) return;
  document.querySelectorAll('.editor input, .editor textarea').forEach((input) => { input.value = ''; });
  $('vat').value = '20';
  lines.replaceChildren();
  addLine();
  updatePreview();
});

const today = new Date();
$('quoteDate').value = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
$('outNumber').textContent = `N° ${today.getFullYear()}-${String(today.getTime()).slice(-6)}`;
addLine('Main-d’œuvre', 1, '', 'Main-d’œuvre');
