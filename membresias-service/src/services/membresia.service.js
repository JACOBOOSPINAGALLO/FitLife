const repo = require('../repositories/membresia.repository');

const error = (status, message) => Object.assign(new Error(message), { status });
const ESTADOS = ['ACTIVA', 'CANCELADA', 'VENCIDA'];

// Comunicación entre microservicios: pregunta a planes-service por el plan
const consultarPlan = async (planId, authorization) => {
  let respuesta;
  try {
    respuesta = await fetch(`${process.env.PLANES_URL}/planes/${planId}`, {
      headers: { Authorization: authorization }
    });
  } catch {
    throw error(503, 'El servicio de planes no está disponible');
  }
  if (respuesta.status === 404) throw error(404, 'El plan no existe');
  if (!respuesta.ok) throw error(502, 'No se pudo consultar el servicio de planes');
  return respuesta.json();
};

const crear = async (usuario, { plan_id }, authorization) => {
  if (!plan_id) throw error(400, 'plan_id es obligatorio');

  await repo.vencerExpiradas();
  if (await repo.findActivaByUsuario(usuario.id)) {
    throw error(409, 'Ya tienes una membresía activa');
  }

  const plan = await consultarPlan(plan_id, authorization);

  const id = await repo.create({
    usuario_id: usuario.id,          // sale del token, no del body: nadie puede comprar a nombre de otro
    plan_id: plan.id,
    plan_nombre: plan.nombre,
    precio: plan.precio,
    duracion_dias: plan.duracion_dias
  });
  return repo.findById(id);
};

const listar = async (usuario) => {
  await repo.vencerExpiradas();
  return usuario.rol === 'ADMIN' ? repo.findAll() : repo.findByUsuario(usuario.id);
};

const miActiva = async (usuario) => {
  await repo.vencerExpiradas();
  const membresia = await repo.findActivaByUsuario(usuario.id);
  if (!membresia) throw error(404, 'No tienes una membresía activa');
  return membresia;
};

const cambiarEstado = async (id, { estado }) => {
  if (!ESTADOS.includes(estado)) throw error(400, `Estado inválido. Usa: ${ESTADOS.join(', ')}`);
  if (!(await repo.findById(id))) throw error(404, 'Membresía no encontrada');
  await repo.updateEstado(id, estado);
  return repo.findById(id);
};

const cancelar = async (usuario, id) => {
  const membresia = await repo.findById(id);
  if (!membresia) throw error(404, 'Membresía no encontrada');
  if (usuario.rol !== 'ADMIN' && membresia.usuario_id !== usuario.id) {
    throw error(403, 'No puedes cancelar la membresía de otro usuario');
  }
  if (membresia.estado === 'CANCELADA') throw error(400, 'La membresía ya está cancelada');
  await repo.updateEstado(id, 'CANCELADA');
  return repo.findById(id);
};

module.exports = { crear, listar, miActiva, cambiarEstado, cancelar };