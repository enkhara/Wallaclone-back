'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

const usuarioSchema = mongoose.Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true, index: true },
  password: String,
  ads_favs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'advertisement'
  }]
},
 {
  collection: 'users'  
});

usuarioSchema.statics.hashPassword = function (passwordEnClaro) {
  return bcrypt.hash(passwordEnClaro, 7);
};

usuarioSchema.methods.comparePassword = function (passwordEnClaro) {
  return bcrypt.compare(passwordEnClaro, this.password);
};

// En los métodos de mongoose no usar Arrow Functions para no tener problemas con el this
// es un método que no está dentro de mongoose
usuarioSchema.statics.lista = async function (filtro, limit, skip, fields, sort){
    const query = User.find(filtro); // no devuelve una promesa, devuelve una query que tiene un método then
    query.limit(limit);
    query.skip(skip);
    query.select(fields);
    query.sort(sort);
    
   return query.exec(); // devuelve una promesa
    
};

const User = mongoose.model('Usuario', usuarioSchema);

module.exports = User;
