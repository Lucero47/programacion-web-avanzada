const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = require('./app');
const conectarDB = require('./config/database');
const { obtenerSecreto } = require('./middleware/autenticacion');
const PORT = Number(process.env.PORT) || 3001;

const iniciarServidor = async () => {
  try {
    obtenerSecreto();
    await conectarDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor listo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exitCode = 1;
  }
};

iniciarServidor();
