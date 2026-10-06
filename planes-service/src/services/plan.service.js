const repo = require('../repositories/plan.repository');

const error = (status, message) => Object.assign(new Error(message), { status });

const validar = ({ nombre, descripcion, precio, duracion_dias }) => {
  if (!nombre || !descripcion || precio === undefined) {
    throw error(400, 'Nombre, descripción y precio son obligatorios');
  }
  if (isNaN(precio) || Number(precio) <= 0) throw error(400, 'El precio debe ser un número mayor a 0');
  if (duracion_dias !== undefined && (!Number.isInteger(duracion_dias) || duracion_dias <= 0)) {
    throw error(400, 'La duración debe ser un número entero de días mayor a 0');
  }
};

const listar = () => repo.findAll();

const obtener = async (id) => {
  const plan = await repo.findById(id);
  if (!plan) throw error(404, 'Plan no encontrado');
  return plan;
};

const crear = async (datos) => {
  validar(datos);
  if (await repo.findByNombre(datos.nombre)) throw error(409, 'Ya existe un plan con ese nombre');
  const id = await repo.create({ ...datos, duracion_dias: datos.duracion_dias || 30 });
  return repo.findById(id);
};

const actualizar = async (id, datos) => {
  await obtener(id);
  validar(datos);
  await repo.update(id, { ...datos, duracion_dias: datos.duracion_dias || 30 });
  return repo.findById(id);
};

const eliminar = async (id) => {
  await obtener(id);
  await repo.remove(id);
  return { mensaje: 'Plan eliminado correctamente' };
};

module.exports = { listar, obtener, crear, actualizar, eliminar };