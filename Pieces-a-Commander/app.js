const $ = (id) => document.getElementById(id);
const KEY = 'garageProjet.parts.v1';
let parts = [];
try { const stored = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(stored)) parts = stored; } catch { parts = []; }
function save() { localStorage.setItem(KEY, JSON.stringify(parts)); }
function dateLabel(value) { return value ? new Intl.DateTimeFormat('fr-FR', {dateStyle:'medium'}).format(new Date(`${value}T12:00:00`)) : '—'; }
function money(value) { return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(value)||0); }

function render() {
  const term = $('search').value.trim().toLocaleLowerCase('fr');
  const matching = parts.filter((part) => `${part.part} ${part.reference} ${part.vehicle} ${part.supplier} ${part.notes}`.toLocaleLowerCase('fr').includes(term)).sort((a,b) => (a.status === 'Reçue') - (b.status === 'Reçue') || b.orderDate.localeCompare(a.orderDate));
  $('count').textContent = `${parts.length} pièce${parts.length === 1 ? '' : 's'} enregistrée${parts.length === 1 ? '' : 's'}`;
  $('needCount').textContent = parts.filter((x) => x.status === 'À commander').length;
  $('orderedCount').textContent = parts.filter((x) => x.status === 'Commandée').length;
  $('receivedCount').textContent = parts.filter((x) => x.status === 'Reçue').length;
  $('empty').hidden = matching.length > 0;
  const list = $('list'); list.replaceChildren();
  for (const item of matching) {
    const row = document.createElement('article'); row.className = 'part-row';
    const main = document.createElement('div'); main.className = 'part-main';
    const name = document.createElement('strong'); name.textContent = item.part;
    const details = document.createElement('p'); details.textContent = [item.reference && `Réf. ${item.reference}`,item.vehicle,item.notes].filter(Boolean).join(' · ');
    main.append(name,details);
    const meta = document.createElement('div'); meta.className = 'part-meta';
    meta.textContent = `${item.supplier || 'Fournisseur non précisé'} · Qté ${item.quantity} · ${money(item.price)} / unité\nCommande : ${dateLabel(item.orderDate)} · Livraison : ${dateLabel(item.deliveryDate)}`;
    const status = document.createElement('select'); status.setAttribute('aria-label',`État de ${item.part}`);
    for (const value of ['À commander','Commandée','Reçue','Annulée']) { const option = new Option(value,value); option.selected = item.status === value; status.add(option); }
    status.addEventListener('change', () => { item.status = status.value; save(); render(); });
    const remove = document.createElement('button'); remove.className = 'delete'; remove.type = 'button'; remove.textContent = '×'; remove.title = 'Supprimer'; remove.addEventListener('click', () => { parts = parts.filter((part) => part.id !== item.id); save(); render(); });
    row.append(main,meta,status,remove); list.append(row);
  }
}

$('form').addEventListener('submit', (event) => {
  event.preventDefault();
  parts.push({ id: crypto.randomUUID?.() || String(Date.now()), part: $('part').value.trim(), reference: $('reference').value.trim(), vehicle: $('vehicle').value.trim(), supplier: $('supplier').value.trim(), quantity: Number($('quantity').value), price: Number($('price').value)||0, orderDate: $('orderDate').value, deliveryDate: $('deliveryDate').value, status: $('status').value, notes: $('notes').value.trim() });
  save(); event.target.reset(); $('quantity').value='1'; render();
});
$('search').addEventListener('input',render);
$('export').addEventListener('click', () => {
  if (!parts.length) return;
  const rows=[['Pièce','Référence','Véhicule','Fournisseur','Quantité','Prix unitaire EUR','Date commande','Livraison prévue','État','Notes'],...parts.map((p)=>[p.part,p.reference,p.vehicle,p.supplier,p.quantity,Number(p.price).toFixed(2),p.orderDate,p.deliveryDate,p.status,p.notes])];
  const csv='\ufeff'+rows.map((r)=>r.map((x)=>`"${String(x).replace(/"/g,'""')}"`).join(';')).join('\r\n'); const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})); const a=document.createElement('a'); a.href=url; a.download='pieces-a-commander.csv'; a.click(); URL.revokeObjectURL(url);
});
render();
