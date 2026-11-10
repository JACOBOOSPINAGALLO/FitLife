const service = require('../services/membresia.service');

const manejar = (fn, status = 200) => async (req, res) => {
  try {
    res.status(status).json(await fn(req));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};

exports.crear = manejar((req) => service.crear(req.usuario, req.body, req.headers.authorization), 201);
exports.listar = manejar((req) => service.listar(req.usuario));
exports.miActiva = manejar((req) => service.miActiva(req.usuario));
exports.cambiarEstado = manejar((req) => service.cambiarEstado(req.params.id, req.body));
exports.cancelar = manejar((req) => service.cancelar(req.usuario, req.params.id));