'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

const usuarioSchema = mongoose.Schema({
  name: { type: String, index: true },
  email: { type: String, unique: true },
  password: String,
});

usuarioSchema.statics.hashPassword = function (passwordEnClaro) {
  return bcrypt.hash(passwordEnClaro, 7);
};

usuarioSchema.methods.comparePassword = function (passwordEnClaro) {
  return bcrypt.compare(passwordEnClaro, this.password);
};

usuarioSchema.methods.enviaEmail = async function(asunto, cuerpo) {

  const transport = await emailTransportConfigure();

  // enviar el correo
  return transport.sendMail({
    from: process.env.EMAIL_SERVICE_FROM,
    to: 'amoltovil@gmail.com', //this.email,
    subject: asunto,
    html: cuerpo
  });

}

const Usuario = mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
