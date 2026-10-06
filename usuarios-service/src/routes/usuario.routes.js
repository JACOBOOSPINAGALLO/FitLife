const router = require('express').Router();
const controller = require('../controllers/usuario.controller');
const auth = require('../middleware/auth');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/perfil', auth, controller.perfil);

module.exports = router;