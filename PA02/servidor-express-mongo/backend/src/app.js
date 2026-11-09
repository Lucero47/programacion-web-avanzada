const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./routes/auth');
const productosRouter = require('./routes/productos');

const app = express();
const publicPath = path.join(__dirname, '..', 'public');

const origins = (process.env.CORS_ORIGINS || 'http://localhost:4200,http://localhost:5174')
  .split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: origins, credentials: false }));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.use(express.static(publicPath));
app.use('/api/auth', authRouter);
app.use('/api/productos', productosRouter);

app.get(['/panel', /^\/panel(?:\/.*)?$/], (req, res, next) => {
  res.sendFile(path.join(publicPath, 'panel', 'index.html'), (error) => {
    if (error) next(error);
  });
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ mensaje: `La ruta '${req.originalUrl}' no existe` });
  }

  if (req.method === 'GET' && req.accepts('html')) {
    return res.sendFile(path.join(publicPath, 'index.html'), (error) => {
      if (error) next(error);
    });
  }

  return res.status(404).json({ mensaje: 'Recurso no encontrado' });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('Error de solicitud:', error.message);

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      mensaje: error.name === 'ValidationError'
        ? Object.values(error.errors).map((item) => item.message).join('. ')
        : 'El valor enviado no tiene un formato válido'
    });
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo de la solicitud no contiene JSON válido' });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({ mensaje: 'El cuerpo de la solicitud supera el tamaño permitido' });
  }

  return res.status(500).json({ mensaje: 'Ocurrió un error interno. Inténtalo nuevamente.' });
});

module.exports = app;
