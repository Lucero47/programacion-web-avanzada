const assert = require('node:assert/strict');
const test = require('node:test');
const { once } = require('node:events');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Usuario = require('../backend/src/models/Usuario');
const { crearToken, obtenerSecreto } = require('../backend/src/middleware/autenticacion');
const authController = require('../backend/src/controllers/auth');

test('roles disponibles coinciden con los permisos documentados', () => {
  assert.deepEqual(Usuario.ROLES, ['admin', 'editor', 'viewer']);
});

test('el hash de contraseña no se selecciona por defecto', () => {
  assert.equal(Usuario.schema.path('passwordHash').options.select, false);
  assert.equal(Usuario.schema.path('passwordHash').options.required, true);
});

test('bcrypt genera un hash verificable sin conservar el texto original', async () => {
  const password = 'clave-de-prueba-2026';
  const hash = await bcrypt.hash(password, 4);
  assert.notEqual(hash, password);
  assert.equal(await bcrypt.compare(password, hash), true);
  assert.equal(await bcrypt.compare('otra-clave', hash), false);
});

test('JWT incluye emisor, audiencia, identificador y versión de sesión', () => {
  const anterior = process.env.JWT_SECRET;
  process.env.JWT_SECRET = 'secreto-de-prueba-largo-para-validar-claims-123';
  try {
    const token = crearToken({ _id: new mongoose.Types.ObjectId(), tokenVersion: 3 });
    const payload = jwt.verify(token, obtenerSecreto(), { issuer: 'nexotech-api', audience: 'nexotech-clients' });
    assert.equal(payload.tv, 3);
    assert.ok(payload.sub);
  } finally {
    if (anterior === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = anterior;
  }
});

test('rechaza el secreto JWT ausente o demasiado corto', () => {
  const anterior = process.env.JWT_SECRET;
  for (const valor of ['', 'corto']) {
    process.env.JWT_SECRET = valor;
    assert.throws(() => obtenerSecreto(), /32 caracteres/);
  }
  if (anterior === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = anterior;
});

test('el registro asigna admin solo a la primera cuenta y no acepta un rol del cliente', async () => {
  const originales = {
    exists: Usuario.exists,
    estimatedDocumentCount: Usuario.estimatedDocumentCount,
    create: Usuario.create
  };
  const entorno = { secret: process.env.JWT_SECRET, adminEmail: process.env.ADMIN_EMAIL };
  const creados = [];
  process.env.JWT_SECRET = 'secreto-de-prueba-largo-para-validar-registro-987';
  delete process.env.ADMIN_EMAIL;
  Usuario.exists = async () => null;
  Usuario.estimatedDocumentCount = async () => creados.length;
  Usuario.create = async (datos) => {
    const usuario = { ...datos, _id: new mongoose.Types.ObjectId(), tokenVersion: 0 };
    creados.push(usuario);
    return usuario;
  };

  const solicitud = (nombre, email) => ({ body: { nombre, email, password: 'clave-segura-2026', rol: 'admin' } });
  const respuesta = () => ({ codigo: 200, cuerpo: null, status(codigo) { this.codigo = codigo; return this; }, json(cuerpo) { this.cuerpo = cuerpo; return this; } });

  try {
    const primera = respuesta();
    await authController.registrar(solicitud('Primera Cuenta', 'primera@ejemplo.test'), primera, (error) => { throw error; });
    const segunda = respuesta();
    await authController.registrar(solicitud('Segunda Cuenta', 'segunda@ejemplo.test'), segunda, (error) => { throw error; });
    assert.equal(primera.codigo, 201);
    assert.equal(primera.cuerpo.usuario.rol, 'admin');
    assert.equal(segunda.cuerpo.usuario.rol, 'viewer');
    assert.equal(Object.hasOwn(primera.cuerpo.usuario, 'passwordHash'), false);
    assert.equal(await bcrypt.compare('clave-segura-2026', creados[0].passwordHash), true);
  } finally {
    Usuario.exists = originales.exists;
    Usuario.estimatedDocumentCount = originales.estimatedDocumentCount;
    Usuario.create = originales.create;
    if (entorno.secret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = entorno.secret;
    if (entorno.adminEmail === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = entorno.adminEmail;
  }
});

test('ADMIN_EMAIL bloquea el registro inicial de una cuenta distinta', async () => {
  const originales = {
    exists: Usuario.exists,
    estimatedDocumentCount: Usuario.estimatedDocumentCount,
    create: Usuario.create
  };
  const adminAnterior = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = 'admin@ejemplo.test';
  Usuario.exists = async () => null;
  Usuario.estimatedDocumentCount = async () => 0;
  Usuario.create = async () => { throw new Error('No debe crear esta cuenta'); };
  const respuesta = { codigo: 200, cuerpo: null, status(codigo) { this.codigo = codigo; return this; }, json(cuerpo) { this.cuerpo = cuerpo; return this; } };
  try {
    await authController.registrar({ body: { nombre: 'Cuenta ajena', email: 'otra@ejemplo.test', password: 'clave-segura-2026' } }, respuesta, (error) => { throw error; });
    assert.equal(respuesta.codigo, 403);
    assert.match(respuesta.cuerpo.mensaje, /ADMIN_EMAIL/);
  } finally {
    Usuario.exists = originales.exists;
    Usuario.estimatedDocumentCount = originales.estimatedDocumentCount;
    Usuario.create = originales.create;
    if (adminAnterior === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = adminAnterior;
  }
});

test('cambiar el rol incrementa la versión y revoca los JWT anteriores', async () => {
  const original = Usuario.findByIdAndUpdate;
  const objetivo = new mongoose.Types.ObjectId();
  const administrador = new mongoose.Types.ObjectId();
  let cambio;
  Usuario.findByIdAndUpdate = async (id, update, options) => {
    cambio = { id, update, options };
    return { _id: objetivo, nombre: 'Editor', email: 'editor@ejemplo.test', rol: update.$set.rol };
  };
  const respuesta = { cuerpo: null, status(codigo) { this.codigo = codigo; return this; }, json(cuerpo) { this.cuerpo = cuerpo; return this; } };
  try {
    await authController.actualizarRol({
      params: { id: objetivo.toString() },
      body: { rol: 'editor' },
      usuario: { id: administrador.toString(), rol: 'admin' }
    }, respuesta, (error) => { throw error; });
    assert.equal(cambio.update.$set.rol, 'editor');
    assert.equal(cambio.update.$inc.tokenVersion, 1);
    assert.equal(cambio.options.runValidators, true);
    assert.equal(respuesta.cuerpo.usuario.rol, 'editor');
  } finally {
    Usuario.findByIdAndUpdate = original;
  }
});

test('Express exige JWT en el CRUD sin conectarse a MongoDB', async () => {
  const app = require('../backend/src/app');
  assert.equal(typeof app, 'function');
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/productos`);
    assert.equal(response.status, 401);
    assert.equal((await response.json()).codigo, 'TOKEN_REQUERIDO');
  } finally {
    server.close();
    await once(server, 'close');
  }
});
