const service = require('../services/plan.service');

const manejar = (fn, status = 200) => async (req, res) => {
  try {
    res.status(status).json(await fn(req));
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message });
  }
};

exports.listar = manejar(() => service.listar());
exports.obtener = manejar((req) => service.obtener(req.params.id));
exports.crear = manejar((req) => service.crear(req.body), 201);
exports.actualizar = manejar((req) => service.actualizar(req.params.id, req.body));
exports.eliminar = manejar((req) => service.eliminar(req.params.id));