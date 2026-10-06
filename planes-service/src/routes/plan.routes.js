const router = require('express').Router();
const controller = require('../controllers/plan.controller');
const { autenticar, soloAdmin } = require('../middleware/auth');

router.get('/', autenticar, controller.listar);
router.get('/:id', autenticar, controller.obtener);
router.post('/', autenticar, soloAdmin, controller.crear);
router.put('/:id', autenticar, soloAdmin, controller.actualizar);
router.delete('/:id', autenticar, soloAdmin, controller.eliminar);

module.exports = router;