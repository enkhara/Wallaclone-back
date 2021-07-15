'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const emailTransportConfigure = require('../lib/emailTransportConfigure');

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

usuarioSchema.methods.enviaEmail = async function (asunto, cuerpo) {
	const transport = await emailTransportConfigure();

	// enviar el correo
	return transport.sendMail({
		from: process.env.EMAIL_SERVICE_FROM,
		to: 'amoltovil@gmail.com', //this.email,
		subject: asunto,
		html: cuerpo,
	});
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
