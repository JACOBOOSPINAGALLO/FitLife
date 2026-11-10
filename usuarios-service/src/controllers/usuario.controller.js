const service = require('../services/usuario.service');

const manejar = (fn, status = 200) => async (req, res) => {
  try {
    const data = await fn(req);
    res.status(status).json(data);
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};

exports.register = manejar((req) => service.register(req.body), 201);
exports.login = manejar((req) => service.login(req.body));
exports.perfil = manejar((req) => service.perfil(req.usuario.id));