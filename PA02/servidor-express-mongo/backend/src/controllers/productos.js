const mongoose = require('mongoose');
const Producto = require('../models/Producto');

const camposProducto = ['nombre', 'categoria', 'descripcion', 'precio'];

const extraerDatos = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};

  return Object.fromEntries(
    camposProducto
      .filter((campo) => Object.prototype.hasOwnProperty.call(body, campo))
      .map((campo) => [campo, body[campo]])
  );
};

const validarId = (id, res) => {
  if (mongoose.isValidObjectId(id)) return true;
  res.status(400).json({ mensaje: 'El identificador del producto no es válido' });
  return false;
};

const listar = async (req, res, next) => {
  try {
    const productos = await Producto.find().sort({ updatedAt: -1, nombre: 1 });
    res.json(productos);
  } catch (error) {
    next(error);
  }
};

const obtenerPorId = async (req, res, next) => {
  if (!validarId(req.params.id, res)) return;

  try {
    const producto = await Producto.findById(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    next(error);
  }
};

const crear = async (req, res, next) => {
  try {
    const producto = await Producto.create(extraerDatos(req.body));
    res.status(201).json({ mensaje: 'Producto registrado correctamente', producto });
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  if (!validarId(req.params.id, res)) return;

  try {
    const datos = extraerDatos(req.body);
    if (Object.keys(datos).length === 0) {
      return res.status(400).json({ mensaje: 'Incluye al menos un campo para actualizar' });
    }

    const producto = await Producto.findByIdAndUpdate(
      req.params.id,
      datos,
      { returnDocument: 'after', runValidators: true }
    );
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto actualizado correctamente', producto });
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  if (!validarId(req.params.id, res)) return;

  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };
