const pool = require('../config/db');

const findAll = async () => {
  const [rows] = await pool.query('SELECT * FROM planes WHERE activo = 1 ORDER BY precio');
  return rows;
};

const findById = async (id) => {
  const [rows] = await pool.query('SELECT * FROM planes WHERE id = ? AND activo = 1', [id]);
  return rows[0];
};

const findByNombre = async (nombre) => {
  const [rows] = await pool.query('SELECT * FROM planes WHERE nombre = ?', [nombre]);
  return rows[0];
};

const create = async ({ nombre, descripcion, precio, duracion_dias }) => {
  const [result] = await pool.query(
    'INSERT INTO planes (nombre, descripcion, precio, duracion_dias) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, precio, duracion_dias]
  );
  return result.insertId;
};

const update = async (id, { nombre, descripcion, precio, duracion_dias }) => {
  await pool.query(
    'UPDATE planes SET nombre = ?, descripcion = ?, precio = ?, duracion_dias = ? WHERE id = ?',
    [nombre, descripcion, precio, duracion_dias, id]
  );
};

// Borrado lógico: no se elimina la fila, solo se desactiva
const remove = async (id) => {
  await pool.query('UPDATE planes SET activo = 0 WHERE id = ?', [id]);
};

module.exports = { findAll, findById, findByNombre, create, update, remove };