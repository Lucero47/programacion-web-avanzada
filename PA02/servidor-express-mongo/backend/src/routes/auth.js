const express = require('express');
const { rateLimit } = require('express-rate-limit');
const auth = require('../controllers/auth');
const { autenticar, autorizar } = require('../middleware/autenticacion');

const router = express.Router();
const limiteAutenticacion = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { mensaje: 'Demasiados intentos. Espera unos minutos antes de intentarlo de nuevo.' }
});

router.post('/registro', limiteAutenticacion, auth.registrar);
router.post('/login', limiteAutenticacion, auth.iniciarSesion);
router.post('/logout', autenticar, auth.cerrarSesion);
router.get('/me', autenticar, auth.miPerfil);
router.get('/usuarios', autenticar, autorizar('admin'), auth.listarUsuarios);
router.patch('/usuarios/:id/rol', autenticar, autorizar('admin'), auth.actualizarRol);

module.exports = router;
