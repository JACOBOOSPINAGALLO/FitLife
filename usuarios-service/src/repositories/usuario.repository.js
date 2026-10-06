const pool = require('../config/db');

const findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

const findById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, email, rol, activo, created_at FROM usuarios WHERE id = ?', [id]
  );
  return rows[0];
};

const create = async ({ nombre, email, password_hash, rol }) => {
  const [result] = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
    [nombre, email, password_hash, rol]
  );
  return result.insertId;
};

module.exports = { findByEmail, findById, create };