const jwt = require('jsonwebtoken');

// AUTENTICACIÓN: ¿quién eres? (token válido)
const autenticar = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    req.usuario = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// AUTORIZACIÓN: ¿qué puedes hacer? (según tu rol)
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol ADMIN' });
  }
  next();
};

module.exports = { autenticar, soloAdmin };