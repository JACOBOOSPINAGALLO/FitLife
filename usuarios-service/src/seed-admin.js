require('dotenv').config();
const bcrypt = require('bcryptjs');
const repo = require('./repositories/usuario.repository');
const pool = require('./config/db');

(async () => {
  const email = 'admin@fitlife.com';
  const existe = await repo.findByEmail(email);
  if (existe) {
    console.log('El admin ya existe');
  } else {
    const password_hash = await bcrypt.hash('Admin123*', 10);
    await repo.create({ nombre: 'Administrador', email, password_hash, rol: 'ADMIN' });
    console.log('✅ Admin creado: admin@fitlife.com / Admin123*');
  }
  await pool.end();
})();