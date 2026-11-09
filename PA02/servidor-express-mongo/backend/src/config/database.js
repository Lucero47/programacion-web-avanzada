const mongoose = require('mongoose');

const conectarDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('Falta configurar MONGO_URI en el archivo .env');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conexión exitosa a MongoDB mediante Mongoose');
};

module.exports = conectarDB;
