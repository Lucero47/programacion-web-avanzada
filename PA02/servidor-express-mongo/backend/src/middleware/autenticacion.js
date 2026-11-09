const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const obtenerSecreto = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres. Configúralo en .env.');
  }
  return secret;
};

const crearToken = (usuario) => jwt.sign(
  { tv: usuario.tokenVersion ?? 0 },
  obtenerSecreto(),
  {
    subject: usuario._id.toString(),
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    issuer: 'nexotech-api',
    audience: 'nexotech-clients'
  }
);

const usuarioPublico = (usuario) => ({
  id: usuario._id.toString(),
  nombre: usuario.nombre,
  email: usuario.email,
  rol: usuario.rol
});

const autenticar = async (req, res, next) => {
  const [scheme, token, ...extra] = (req.get('authorization') || '').trim().split(/\s+/);
  if (scheme !== 'Bearer' || !token || extra.length > 0) {
    return res.status(401).json({ mensaje: 'Inicia sesión para continuar', codigo: 'TOKEN_REQUERIDO' });
  }

  try {
    const payload = jwt.verify(token, obtenerSecreto(), {
      issuer: 'nexotech-api',
      audience: 'nexotech-clients'
    });
    const usuario = await Usuario.findById(payload.sub).select('+tokenVersion');
    if (!usuario || usuario.tokenVersion !== payload.tv) {
      return res.status(401).json({ mensaje: 'La sesión ya no es válida', codigo: 'TOKEN_INVALIDO' });
    }

    req.usuario = usuarioPublico(usuario);
    next();
  } catch (error) {
    const expired = error.name === 'TokenExpiredError';
    if (expired || error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        mensaje: expired ? 'La sesión expiró. Inicia sesión nuevamente.' : 'El token de acceso no es válido',
        codigo: expired ? 'TOKEN_EXPIRADO' : 'TOKEN_INVALIDO'
      });
    }
    next(error);
  }
};

const autorizar = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) return res.status(401).json({ mensaje: 'Inicia sesión para continuar' });
  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes permiso para realizar esta operación', codigo: 'ROL_INSUFICIENTE' });
  }
  next();
};

module.exports = { autenticar, autorizar, crearToken, obtenerSecreto, usuarioPublico };
