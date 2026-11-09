const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const conectarDB = require('../src/config/database');
const Producto = require('../src/models/Producto');

const productosDePrueba = [
  {
    nombre: 'Teclado mecánico Kairo 75',
    categoria: 'Periféricos',
    descripcion: 'Teclado compacto con switches táctiles, conexión USB-C y retroiluminación blanca.',
    precio: 239.9
  },
  {
    nombre: 'Mouse inalámbrico Vector M2',
    categoria: 'Periféricos',
    descripcion: 'Mouse ergonómico con sensor ajustable, Bluetooth y batería recargable.',
    precio: 119.9
  },
  {
    nombre: 'Audífonos Studio Air',
    categoria: 'Audio',
    descripcion: 'Audífonos inalámbricos con cancelación de ruido y estuche de carga.',
    precio: 189.9
  },
  {
    nombre: 'Hub USB-C Multiport 7 en 1',
    categoria: 'Conectividad',
    descripcion: 'Adaptador con HDMI 4K, lector SD, USB 3.0 y carga pass-through.',
    precio: 149.9
  },
  {
    nombre: 'Soporte de aluminio Elevate',
    categoria: 'Accesorios',
    descripcion: 'Base plegable para laptop con altura regulable y almohadillas antideslizantes.',
    precio: 99.9
  },
  {
    nombre: 'Webcam Orbit HD',
    categoria: 'Video',
    descripcion: 'Cámara Full HD con micrófono integrado, tapa de privacidad y clip universal.',
    precio: 169.9
  }
];

const muestrasAnteriores = [
  { nombre: 'Hojas bond' },
  { nombre: 'Chocolate bitter' },
  { nombre: 'Cuaderno de notas' },
  { nombre: 'Taza de cerámica' }
];

const sembrarProductos = async () => {
  try {
    await conectarDB();
    let insertados = 0;
    let reemplazados = 0;
    let existentes = 0;

    for (const [indice, producto] of productosDePrueba.entries()) {
      const anterior = muestrasAnteriores[indice];
      const registroAnterior = anterior
        ? await Producto.findOne({ nombre: anterior.nombre })
        : null;

      if (registroAnterior) {
        const duplicado = await Producto.findOne({
          nombre: producto.nombre,
          categoria: producto.categoria
        });
        if (duplicado && !duplicado._id.equals(registroAnterior._id)) {
          await Producto.deleteOne({ _id: duplicado._id });
        }

        await Producto.updateOne(
          { _id: registroAnterior._id },
          { $set: producto },
          { runValidators: true }
        );
        reemplazados += 1;
        continue;
      }

      const resultado = await Producto.updateOne(
        { nombre: producto.nombre, categoria: producto.categoria },
        { $setOnInsert: producto },
        { upsert: true }
      );
      insertados += resultado.upsertedCount;
      existentes += resultado.upsertedCount ? 0 : 1;
    }

    console.log(`Catálogo electrónico listo. Muestras anteriores reemplazadas: ${reemplazados}; artículos nuevos: ${insertados}; ya existentes: ${existentes}.`);
  } catch (error) {
    console.error('No se pudieron cargar los datos de prueba:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

sembrarProductos();
