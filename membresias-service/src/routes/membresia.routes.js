const router = require('express').Router();
const controller = require('../controllers/membresia.controller');
const { autenticar, soloAdmin } = require('../middleware/auth');

router.post('/', autenticar, controller.crear);
router.get('/', autenticar, controller.listar);
router.get('/mia', autenticar, controller.miActiva);
router.put('/:id/estado', autenticar, soloAdmin, controller.cambiarEstado);
router.delete('/:id', autenticar, controller.cancelar);

module.exports = router;