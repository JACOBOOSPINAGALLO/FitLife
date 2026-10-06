const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const repo = require('../repositories/usuario.repository');

const error = (status, message) => Object.assign(new Error(message), { status });

const register = async ({ nombre, email, password }) => {
  if (!nombre || !email || !password) throw error(400, 'Nombre, email y contraseña son obligatorios');
  if (password.length < 6) throw error(400, 'La contraseña debe tener mínimo 6 caracteres');

  const existe = await repo.findByEmail(email);
  if (existe) throw error(409, 'Ya existe un usuario con ese email');

  const password_hash = await bcrypt.hash(password, 10);
  const id = await repo.create({ nombre, email, password_hash, rol: 'CLIENTE' });
  return repo.findById(id);
};

const login = async ({ email, password }) => {
  if (!email || !password) throw error(400, 'Email y contraseña son obligatorios');

  const usuario = await repo.findByEmail(email);
  if (!usuario || !usuario.activo) throw error(401, 'Credenciales inválidas');

  const ok = await bcrypt.compare(password, usuario.password_hash);
  if (!ok) throw error(401, 'Credenciales inválidas');

  const token = jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES }
  );

  return { token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } };
};

const perfil = async (id) => {
  const usuario = await repo.findById(id);
  if (!usuario) throw error(404, 'Usuario no encontrado');
  return usuario;
};

module.exports = { register, login, perfil };