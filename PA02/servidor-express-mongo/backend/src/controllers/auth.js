const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Usuario = require('../models/Usuario');
const { crearToken, usuarioPublico } = require('../middleware/autenticacion');

const COSTO_HASH = 12;

const registrar = async (req, res, next) => {
  try {
    const nombre = typeof req.body?.nombre === 'string' ? req.body.nombre.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: 'Nombre, correo y contraseña son obligatorios' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes' });
    }

    const existe = await Usuario.exists({ email });
    if (existe) return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });

    const primerUsuario = (await Usuario.estimatedDocumentCount()) === 0;
    const correoAdministrador = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const correoAdmin = Boolean(correoAdministrador) && correoAdministrador === email;
    if (primerUsuario && correoAdministrador && !correoAdmin) {
      return res.status(403).json({ mensaje: 'Registra primero la cuenta indicada en ADMIN_EMAIL para crear el administrador' });
    }
    const passwordHash = await bcrypt.hash(password, COSTO_HASH);
    const usuario = await Usuario.create({
      nombre,
      email,
      passwordHash,
      rol: primerUsuario || correoAdmin ? 'admin' : 'viewer'
    });
    const token = crearToken(usuario);
    return res.status(201).json({ mensaje: 'Cuenta creada correctamente', token, usuario: usuarioPublico(usuario) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese correo' });
    next(error);
  }
};

const iniciarSesion = async (req, res, next) => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) return res.status(400).json({ mensaje: 'Correo y contraseña son obligatorios' });

    const usuario = await Usuario.findOne({ email }).select('+passwordHash +tokenVersion');
    const valido = usuario && await bcrypt.compare(password, usuario.passwordHash);
    if (!valido) return res.status(401).json({ mensaje: 'Correo o contraseña incorrectos' });

    return res.json({ mensaje: 'Sesión iniciada', token: crearToken(usuario), usuario: usuarioPublico(usuario) });
  } catch (error) {
    next(error);
  }
};

const cerrarSesion = async (req, res, next) => {
  try {
    await Usuario.updateOne({ _id: req.usuario.id }, { $inc: { tokenVersion: 1 } });
    res.json({ mensaje: 'Sesión cerrada correctamente' });
  } catch (error) {
    next(error);
  }
};

const miPerfil = (req, res) => res.json({ usuario: req.usuario });

const listarUsuarios = async (req, res, next) => {
  try {
    const usuarios = await Usuario.find().sort({ createdAt: 1 }).select('nombre email rol createdAt');
    res.json(usuarios.map((usuario) => ({ ...usuarioPublico(usuario), createdAt: usuario.createdAt })));
  } catch (error) {
    next(error);
  }
};

const actualizarRol = async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ mensaje: 'El identificador del usuario no es válido' });
  }
  if (!Usuario.ROLES.includes(req.body?.rol)) {
    return res.status(400).json({ mensaje: 'El rol debe ser admin, editor o viewer' });
  }
  if (req.params.id === req.usuario.id && req.body.rol !== 'admin') {
    return res.status(400).json({ mensaje: 'No puedes quitarte tu propio rol de administrador' });
  }

  try {
    const usuario = await Usuario.findByIdAndUpdate(
      req.params.id,
      { $set: { rol: req.body.rol }, $inc: { tokenVersion: 1 } },
      { returnDocument: 'after', runValidators: true }
    );
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json({ mensaje: 'Rol actualizado correctamente', usuario: usuarioPublico(usuario) });
  } catch (error) {
    next(error);
  }
};

module.exports = { registrar, iniciarSesion, cerrarSesion, miPerfil, listarUsuarios, actualizarRol };
