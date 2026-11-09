const mongoose = require('mongoose');

const ROLES = ['admin', 'editor', 'viewer'];

const usuarioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [80, 'El nombre no puede superar 80 caracteres']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: [254, 'El correo electrónico no es válido'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Escribe un correo electrónico válido']
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  rol: {
    type: String,
    enum: ROLES,
    default: 'viewer',
    required: true
  },
  tokenVersion: {
    type: Number,
    default: 0,
    select: false
  }
}, { timestamps: true });

usuarioSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('Usuario', usuarioSchema);
