'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

const userSchema = mongoose.Schema({
  username: { type: String, unique: true, index: true },
  email: { type: String, unique: true, index: true },
  password: String,   
  ads_favs: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: 'Advertisement'
   }]
},
 {
  collection: 'users'  
});

userSchema.statics.hashPassword = function (passwordEnClaro) {
  return bcrypt.hash(passwordEnClaro, 7);
};

// Método de Instancia
userSchema.methods.comparePassword = function (passwordEnClaro) {
  return bcrypt.compare(passwordEnClaro, this.password);
};

// En los métodos de mongoose no usar Arrow Functions para no tener problemas con el this
// es un método que no está dentro de mongoose
userSchema.statics.lista = async function (filtro, limit, skip, fields, sort){
    const query = User.find(filtro); // no devuelve una promesa, devuelve una query que tiene un método then
    query.limit(limit);
    query.skip(skip);
    query.select(fields);
    query.sort(sort);
    
   return query.exec(); // devuelve una promesa
    
};

const User = mongoose.model('User', userSchema);

module.exports = User;
