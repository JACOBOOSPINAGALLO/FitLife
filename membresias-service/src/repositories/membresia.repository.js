const pool = require('../config/db');

const SELECT = `SELECT *, DATEDIFF(fecha_fin, CURDATE()) AS dias_restantes FROM membresias`;

// Marca como VENCIDA toda membresía ACTIVA cuya fecha_fin ya pasó
const vencerExpiradas = async () => {
  await pool.query(
    "UPDATE membresias SET estado = 'VENCIDA' WHERE estado = 'ACTIVA' AND fecha_fin < CURDATE()"
  );
};

const findAll = async () => {
  const [rows] = await pool.query(`${SELECT} ORDER BY id DESC`);
  return rows;
};

const findByUsuario = async (usuarioId) => {
  const [rows] = await pool.query(`${SELECT} WHERE usuario_id = ? ORDER BY id DESC`, [usuarioId]);
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query(`${SELECT} WHERE id = ?`, [id]);
  return rows[0];
};

const findActivaByUsuario = async (usuarioId) => {
  const [rows] = await pool.query(
    `${SELECT} WHERE usuario_id = ? AND estado = 'ACTIVA' LIMIT 1`, [usuarioId]
  );
  return rows[0];
};

const create = async ({ usuario_id, plan_id, plan_nombre, precio, duracion_dias }) => {
  const [result] = await pool.query(
    `INSERT INTO membresias (usuario_id, plan_id, plan_nombre, precio, fecha_inicio, fecha_fin)
     VALUES (?, ?, ?, ?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL ? DAY))`,
    [usuario_id, plan_id, plan_nombre, precio, duracion_dias]
  );
  return result.insertId;
};

const updateEstado = async (id, estado) => {
  await pool.query('UPDATE membresias SET estado = ? WHERE id = ?', [estado, id]);
};

module.exports = {
  vencerExpiradas, findAll, findByUsuario, findById, findActivaByUsuario, create, updateEstado
};