'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');
const { getMaxListeners } = require('./Anuncio');

const usuarioSchema = mongoose.Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true, index: true },
  password: String,
});

usuarioSchema.statics.hashPassword = function (passwordEnClaro) {
  return bcrypt.hash(passwordEnClaro, 7);
};

usuarioSchema.methods.comparePassword = function (passwordEnClaro) {
  return bcrypt.compare(passwordEnClaro, this.password);
};

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
