const express = require('express');
const router = express.Router({
  mergeParams: true,
});
const authMiddleware = require('../middleware/authMiddleware');
const controller = require('../controllers/songController');
router.use(authMiddleware);
router.get('/', controller.listarMusicas);
router.post('/', controller.criarMusica);
router.get('/:songId', controller.buscarMusica);
router.put('/:songId', controller.atualizarMusica);
router.delete('/:songId', controller.excluirMusica);
module.exports = router;
