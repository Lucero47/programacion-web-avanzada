const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del producto es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede superar 100 caracteres']
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es obligatoria'],
    trim: true,
    minlength: [2, 'La categoría debe tener al menos 2 caracteres'],
    maxlength: [60, 'La categoría no puede superar 60 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede superar 500 caracteres'],
    default: ''
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo'],
    validate: { validator: Number.isFinite, message: 'El precio debe ser un número válido' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);
