const $ = (id) => document.getElementById(id);
const KEY = 'garageProjet.planning.v1';
const STATUSES = ['Prévu', 'En cours', 'Terminé', 'En attente'];
let appointments = [];
try { const saved = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(saved)) appointments = saved; } catch { appointments = []; }

function save() { localStorage.setItem(KEY, JSON.stringify(appointments)); }
function startMinutes(value) { const [h,m] = value.split(':').map(Number); return h * 60 + m; }
function endTime(item) { const end = startMinutes(item.time) + Number(item.duration); return `${String(Math.floor(end / 60) % 24).padStart(2,'0')}:${String(end % 60).padStart(2,'0')}`; }

function render() {
  const day = $('filterDate').value;
  const items = appointments.filter((item) => item.date === day).sort((a,b) => a.time.localeCompare(b.time));
  $('dayCount').textContent = `${items.length} intervention${items.length === 1 ? '' : 's'}`;
  $('empty').hidden = items.length > 0;
  const board = $('schedule'); board.replaceChildren();
  for (const item of items) {
    const row = document.createElement('article'); row.className = 'appointment';
    const time = document.createElement('div'); time.className = 'time'; time.textContent = `${item.time} – ${endTime(item)}`;
    const timeNote = document.createElement('small'); timeNote.textContent = `${item.duration} min`; time.append(timeNote);
    const detail = document.createElement('div'); detail.className = 'details';
    const title = document.createElement('strong'); title.textContent = `${item.plate ? `${item.plate} · ` : ''}${item.vehicle}`;
    const job = document.createElement('p'); job.textContent = item.job; detail.append(title,job);
    const select = document.createElement('select'); select.setAttribute('aria-label', `Statut de ${item.vehicle}`);
    for (const status of STATUSES) { const option = new Option(status,status); option.selected = item.status === status; select.add(option); }
    select.addEventListener('change', () => { item.status = select.value; save(); });
    detail.append(title,job,select);
    const mechanic = document.createElement('div'); mechanic.className = 'mechanic'; mechanic.textContent = item.mechanic;
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = '×'; remove.title = 'Supprimer'; remove.addEventListener('click', () => { appointments = appointments.filter((x) => x.id !== item.id); save(); render(); });
    row.append(time,detail,mechanic,remove); board.append(row);
  }
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault();
  const item = { id: crypto.randomUUID?.() || String(Date.now()), date: $('date').value, time: $('time').value, duration: Number($('duration').value), mechanic: $('mechanic').value.trim(), vehicle: $('vehicle').value.trim(), plate: $('plate').value.trim(), job: $('job').value.trim(), status: 'Prévu' };
  const proposedStart = startMinutes(item.time); const proposedEnd = proposedStart + item.duration;
  const overlaps = appointments.filter((other) => other.date === item.date && other.mechanic.toLocaleLowerCase('fr') === item.mechanic.toLocaleLowerCase('fr')).filter((other) => proposedStart < startMinutes(other.time) + Number(other.duration) && proposedEnd > startMinutes(other.time));
  if (overlaps.length) {
    const names = overlaps.map((x) => `${x.time} (${x.vehicle})`).join(', ');
    if (!window.confirm(`Attention : ce mécanicien a déjà une intervention qui chevauche (${names}). Ajouter quand même ?`)) return;
  }
  appointments.push(item); save(); $('filterDate').value = item.date; render();
  $('vehicle').value = ''; $('plate').value = ''; $('job').value = '';
});
$('filterDate').addEventListener('change',render);
const today = new Date(); const todayText = [today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
$('date').value = todayText; $('filterDate').value = todayText; render();
