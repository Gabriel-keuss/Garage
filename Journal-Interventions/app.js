const $ = (id) => document.getElementById(id);
const KEY = 'garageProjet.interventions.v1';
let records = [];
try { const stored = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(stored)) records = stored; } catch { records = []; }

function save() { localStorage.setItem(KEY, JSON.stringify(records)); }
function frDate(value) { return value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(`${value}T12:00:00`)) : ''; }

function render() {
  const term = $('search').value.trim().toLocaleLowerCase('fr');
  const shown = records.filter((record) => `${record.plate} ${record.vehicle} ${record.customer} ${record.work} ${record.type}`.toLocaleLowerCase('fr').includes(term)).sort((a,b) => b.date.localeCompare(a.date));
  $('count').textContent = `${records.length} intervention${records.length > 1 ? 's' : ''} enregistrée${records.length > 1 ? 's' : ''}`;
  $('empty').hidden = shown.length > 0;
  const container = $('entries'); container.replaceChildren();
  for (const record of shown) {
    const article = document.createElement('article'); article.className = 'entry';
    const date = document.createElement('div'); date.className = 'entry-date'; date.textContent = frDate(record.date);
    const main = document.createElement('div'); main.className = 'entry-main';
    const title = document.createElement('strong'); title.textContent = `${record.plate} · ${record.vehicle}`;
    const meta = document.createElement('span'); meta.className = 'entry-meta'; meta.textContent = `${record.type}${record.customer ? ` · ${record.customer}` : ''}${record.mileage ? ` · ${record.mileage}` : ''}`;
    const work = document.createElement('p'); work.className = 'entry-work'; work.textContent = record.work;
    main.append(title, meta, work);
    const remove = document.createElement('button'); remove.className = 'entry-delete'; remove.type = 'button'; remove.textContent = '×'; remove.title = 'Supprimer cette intervention';
    remove.addEventListener('click', () => { records = records.filter((item) => item.id !== record.id); save(); render(); });
    article.append(date, main, remove); container.append(article);
  }
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault();
  records.push({ id: crypto.randomUUID?.() || String(Date.now()), date: $('date').value, plate: $('plate').value.trim(), vehicle: $('vehicle').value.trim(), customer: $('customer').value.trim(), mileage: $('mileage').value.trim(), type: $('type').value, work: $('work').value.trim() });
  save(); event.target.reset(); $('date').value = new Date().toISOString().slice(0,10); render();
});
$('search').addEventListener('input', render);
$('export').addEventListener('click', () => {
  if (!records.length) return;
  const rows = [['Date','Immatriculation','Véhicule','Client','Kilométrage','Type','Travaux'], ...records.map((r) => [r.date,r.plate,r.vehicle,r.customer,r.mileage,r.type,r.work])];
  const csv = '\ufeff' + rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g,'""')}"`).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'})); const link = document.createElement('a'); link.href=url; link.download='journal-interventions.csv'; link.click(); URL.revokeObjectURL(url);
});
$('date').value = new Date().toISOString().slice(0,10);
render();
