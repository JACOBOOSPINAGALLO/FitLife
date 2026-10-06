if (!getToken() || !getUsuario()) {
  cerrarSesion();
  throw new Error('Sin sesión');
}

const usuario = getUsuario();
const esAdmin = usuario.rol === 'ADMIN';
const $ = (s) => document.querySelector(s);

const TITULOS = {
  inicio: 'Dashboard',
  planes: esAdmin ? 'Gestionar planes' : 'Planes',
  membresia: esAdmin ? 'Membresías' : 'Mi membresía',
  perfil: 'Perfil'
};

$('#chip-nombre').textContent = usuario.nombre;
$('#chip-rol').textContent = usuario.rol;
$('#chip-rol').classList.add(usuario.rol);
if (esAdmin) {
  $('#nav-planes').textContent = 'Gestionar planes';
  $('#nav-membresia').textContent = 'Membresías';
}

const badge = (estado) => `<span class="badge ${esc(estado)}">${esc(estado)}</span>`;
const stat = (n, texto) => `<div class="card stat"><strong>${n}</strong><span>${texto}</span></div>`;

/* ---------- Secciones ---------- */
function tarjetaMembresia(m) {
  const total = Math.max(1, Math.round((new Date(m.fecha_fin) - new Date(m.fecha_inicio)) / 86400000));
  const restantes = Math.max(0, m.dias_restantes);
  const pct = Math.min(100, Math.round((restantes / total) * 100));
  return `
    <div class="card membership">
      <div class="row"><span class="label">TU MEMBRESÍA</span>${badge(m.estado)}</div>
      <h2 class="plan-name">${esc(m.plan_nombre)}</h2>
      <p class="muted">${formatearPrecio(m.precio)} · ${esc(m.fecha_inicio)} → ${esc(m.fecha_fin)}</p>
      <div class="progress"><div style="width:${pct}%"></div></div>
      <p><strong>${restantes}</strong> días restantes</p>
    </div>`;
}

async function cargarInicio() {
  const el = $('#sec-inicio');
  el.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    if (esAdmin) {
      const [planes, membresias] = await Promise.all([api('/planes'), api('/membresias')]);
      const activas = membresias.filter((m) => m.estado === 'ACTIVA').length;
      el.innerHTML = `
        <h2 class="welcome">Bienvenido, ${esc(usuario.nombre)}</h2>
        <div class="stats">
          ${stat(planes.length, 'Planes activos')}
          ${stat(membresias.length, 'Membresías registradas')}
          ${stat(activas, 'Membresías activas')}
        </div>`;
      return;
    }
    let m = null;
    try { m = await api('/membresias/mia'); } catch {}
    el.innerHTML = `<h2 class="welcome">Bienvenido, ${esc(usuario.nombre)}</h2>` + (m
      ? tarjetaMembresia(m)
      : `<div class="card empty">
           <h3>Aún no tienes una membresía</h3>
           <p class="muted">Elige un plan para empezar a entrenar.</p>
           <button class="btn" data-go="planes">Ver planes</button>
         </div>`);
  } catch (e) {
    el.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

function tarjetaPlan(p) {
  const items = p.descripcion
    .split(/,\s*|\s+y\s+/)
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  return `
    <div class="card plan ${p.nombre === 'Premium' ? 'featured' : ''}">
      <h3>${esc(p.nombre)}</h3>
      <div class="price">${formatearPrecio(p.precio)}<small> / ${p.duracion_dias} días</small></div>
      <ul>${items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>
      ${esAdmin
        ? `<button class="btn btn-danger" data-action="eliminar-plan" data-id="${p.id}">Eliminar</button>`
        : `<button class="btn" data-action="elegir-plan" data-id="${p.id}">Elegir plan</button>`}
    </div>`;
}

async function cargarPlanes() {
  const el = $('#sec-planes');
  el.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    const planes = await api('/planes');
    const form = esAdmin ? `
      <form id="form-plan" class="card form-plan">
        <label>Nombre<input name="nombre" required></label>
        <label>Descripción<input name="descripcion" placeholder="Gimnasio, clases y vestier" required></label>
        <label>Precio (COP)<input name="precio" type="number" min="1" required></label>
        <label>Duración (días)<input name="duracion_dias" type="number" min="1" value="30" required></label>
        <button class="btn">Crear plan</button>
      </form>` : '';
    el.innerHTML = form + `<div class="plans">${planes.map(tarjetaPlan).join('')}</div>`;
  } catch (e) {
    el.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

function tabla(lista) {
  if (!lista.length) return '<p class="muted">No hay membresías registradas.</p>';
  const filas = lista.map((m) => `
    <tr>
      ${esAdmin ? `<td>Usuario #${m.usuario_id}</td>` : ''}
      <td>${esc(m.plan_nombre)}</td>
      <td>${formatearPrecio(m.precio)}</td>
      <td>${esc(m.fecha_inicio)}</td>
      <td>${esc(m.fecha_fin)}</td>
      <td>${esAdmin
        ? `<select data-action="estado" data-id="${m.id}">
             ${['ACTIVA', 'CANCELADA', 'VENCIDA'].map((s) => `<option ${s === m.estado ? 'selected' : ''}>${s}</option>`).join('')}
           </select>`
        : badge(m.estado)}</td>
    </tr>`).join('');
  return `<div class="table-wrap"><table>
    <thead><tr>${esAdmin ? '<th>Usuario</th>' : ''}<th>Plan</th><th>Precio</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr></thead>
    <tbody>${filas}</tbody></table></div>`;
}

async function cargarMembresia() {
  const el = $('#sec-membresia');
  el.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    if (esAdmin) {
      el.innerHTML = tabla(await api('/membresias'));
      return;
    }
    let activa = null;
    try { activa = await api('/membresias/mia'); } catch {}
    const historial = await api('/membresias');
    el.innerHTML = (activa
      ? tarjetaMembresia(activa) + `<button class="btn btn-danger" data-action="cancelar" data-id="${activa.id}">Cancelar membresía</button>`
      : `<div class="card empty">
           <h3>No tienes una membresía activa</h3>
           <button class="btn" data-go="planes">Ver planes</button>
         </div>`)
      + '<h3 class="subtitle">Historial</h3>' + tabla(historial);
  } catch (e) {
    el.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function cargarPerfil() {
  const el = $('#sec-perfil');
  el.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    const p = await api('/usuarios/perfil');
    el.innerHTML = `
      <div class="card profile">
        <div><span class="muted">Nombre</span><strong>${esc(p.nombre)}</strong></div>
        <div><span class="muted">Correo</span><strong>${esc(p.email)}</strong></div>
        <div><span class="muted">Rol</span>${badge(p.rol)}</div>
        <div><span class="muted">Miembro desde</span><strong>${new Date(p.created_at).toLocaleDateString('es-CO')}</strong></div>
      </div>`;
  } catch (e) {
    el.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

const cargadores = { inicio: cargarInicio, planes: cargarPlanes, membresia: cargarMembresia, perfil: cargarPerfil };

function mostrarSeccion(nombre) {
  document.querySelectorAll('.nav-item[data-section]').forEach((b) =>
    b.classList.toggle('active', b.dataset.section === nombre));
  document.querySelectorAll('.section').forEach((s) =>
    s.classList.toggle('active', s.id === `sec-${nombre}`));
  $('#titulo').textContent = TITULOS[nombre];
  cargadores[nombre]();
}

/* ---------- Eventos ---------- */
document.addEventListener('click', async (e) => {
  const go = e.target.closest('[data-go]');
  if (go) return mostrarSeccion(go.dataset.go);

  const nav = e.target.closest('.nav-item[data-section]');
  if (nav) return mostrarSeccion(nav.dataset.section);

  const btn = e.target.closest('[data-action]');
  if (!btn || btn.tagName === 'SELECT') return;
  const { action, id } = btn.dataset;

  try {
    if (action === 'logout') return cerrarSesion();

    if (action === 'elegir-plan') {
      if (!confirm('¿Quieres adquirir este plan?')) return;
      await api('/membresias', { method: 'POST', body: { plan_id: Number(id) } });
      toast('¡Membresía activada!');
      mostrarSeccion('inicio');
    }
    if (action === 'eliminar-plan') {
      if (!confirm('¿Eliminar este plan?')) return;
      await api(`/planes/${id}`, { method: 'DELETE' });
      toast('Plan eliminado');
      cargarPlanes();
    }
    if (action === 'cancelar') {
      if (!confirm('¿Seguro que quieres cancelar tu membresía?')) return;
      await api(`/membresias/${id}`, { method: 'DELETE' });
      toast('Membresía cancelada');
      cargarMembresia();
    }
  } catch (err) {
    toast(err.message, true);
  }
});

document.addEventListener('change', async (e) => {
  if (e.target.dataset.action !== 'estado') return;
  try {
    await api(`/membresias/${e.target.dataset.id}/estado`, { method: 'PUT', body: { estado: e.target.value } });
    toast('Estado actualizado');
  } catch (err) {
    toast(err.message, true);
    cargarMembresia();
  }
});

document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'form-plan') return;
  e.preventDefault();
  const f = new FormData(e.target);
  try {
    await api('/planes', {
      method: 'POST',
      body: {
        nombre: f.get('nombre'),
        descripcion: f.get('descripcion'),
        precio: Number(f.get('precio')),
        duracion_dias: Number(f.get('duracion_dias'))
      }
    });
    toast('Plan creado');
    cargarPlanes();
  } catch (err) {
    toast(err.message, true);
  }
});

mostrarSeccion('inicio');