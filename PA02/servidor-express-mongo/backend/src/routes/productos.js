const express = require('express');
const productosController = require('../controllers/productos');
const { autenticar, autorizar } = require('../middleware/autenticacion');

const router = express.Router();

router.use(autenticar);
router.get('/', productosController.listar);
router.get('/:id', productosController.obtenerPorId);
router.post('/', autorizar('admin', 'editor'), productosController.crear);
router.put('/:id', autorizar('admin', 'editor'), productosController.actualizar);
router.delete('/:id', autorizar('admin', 'editor'), productosController.eliminar);

module.exports = router;
