require('dotenv').config();
const bcrypt = require('bcryptjs');
const repo = require('./repositories/usuario.repository');
const pool = require('./config/db');

(async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben estar configurados en usuarios-service/.env');
  }

  try {
    const existe = await repo.findByEmail(email);
    if (existe) {
      console.log('El admin ya existe');
    } else {
      const password_hash = await bcrypt.hash(password, 10);
      await repo.create({ nombre: 'Administrador', email, password_hash, rol: 'ADMIN' });
      console.log(`✅ Admin creado: ${email}`);
    }
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error('No se pudo crear el administrador:', error.message);
  process.exitCode = 1;
});