'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// definimos un esquema, le pasamos un objecto
// es opcional añadir la colección
// Al poner la opción de index:true creamos indice para el campo de la colección
const advertisementSchema = mongoose.Schema(
	{
		name: { type: String, index: true },
		desc: { type: String, index: true },
		transaction: { type: String, index: true },
		price: { type: Number, index: true },
		image: String,
		tags: [{ type: String, index: true }],
		updatedAt: { type: Date },
		reserved: { type: Boolean },
		sold: { type: Boolean },
		userId: { type: Schema.Types.ObjectId, ref: 'User', index: true}
	},
	{
		collection: 'advertisements', // para evitar la pluralizacion, le indicamos que colección va a usar
	}
);

// Define query helper, son como métodos de instancia
advertisementSchema.query.byName = function (nombre) {
	return this.where({ name: new RegExp(nombre, 'i') });
};

//para llamarlo en el controlador
// Anuncio.find().byName('Taza').exec((err, ads) => {
//     console.log(ads);
// });

/**
 * Métodos de instancia
 */
advertisementSchema.methods.crear = function () {
	this.updatedAt = Date.now();
	this.sold = false;
	this.reserved = false;
	return this.save();
};

advertisementSchema.methods.actualizar = function () {
	this.updatedAt = Date.now();
	return this.save();
};

// Marcamos el anuncio como vendido
advertisementSchema.methods.vender = function () {
	this.sold = true;
	return this.save();
};

// Marcamos el anuncio como no vendido
advertisementSchema.methods.no_Vender = function () {
	this.sold = false;
	return this.save();
};

// Marcamos el anuncio como reservado
advertisementSchema.methods.reservar = function () {
	this.reserved = true;
	return this.save();
};

// Marcamos el anuncio como no reservado
advertisementSchema.methods.desreservar = function () {
	this.reserved = false;
	return this.save();
};

// En los métodos de mongoose no usar Arrow Functions para no tener problemas con el this
// es un método que no está dentro de mongoose
advertisementSchema.statics.lista = async function (
	filtro,
	limit,
	skip,
	fields,
	sort
) {
	// no devuelve una promesa, devuelve una query que tiene un método then
	const query = Advertisement.find(filtro);
	
	query.limit(limit);
	query.skip(skip);
	query.select(fields);
	query.sort(sort);
	query.populate({ path: 'userId' });

	// const result = {};
	// if (includeTotal) {
	// 	result.total = await Advertisement.countDocuments();
	// 	console.log('Total documentos', result.total);
	// }
	// result.rows = await query.exec();

	// if (cb) return cb(null, result);
	// return result;

	return await query.exec(); // devuelve una promesa
};

// Método para listar los distintos tags definidos
advertisementSchema.statics.listaTags = function () {
	const query = Advertisement.find().distinct('tags');
	return query.exec();
};

advertisementSchema.statics.allowedTags = function () {
	return ['work', 'kitchen', 'lifestyle', 'motor', 'mobile'];
};

const Advertisement = mongoose.model('Advertisement', advertisementSchema);

module.exports = Advertisement;
